import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft, faCaretRight, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { appStyles, boardStyles, cardStyles, getRandomColor, headerStyles, iconStyles } from './core/styles.js'
import './App.css';

class App extends Component {
  boardRefs = [];
  randomColors = [];
  hoveredBoard;

  constructor(props) {
    super(props);
    const names = (this.props.names) ? this.props.names : ['Derrick', 'Maxwell', 'Zaza', 'Sam'];
    
    this.randomColors = (window.localStorage.colors) ? JSON.parse(window.localStorage.colors) : [];

    if (this.randomColors.length === 0) {
      this.randomColors = names.reduce((acc) => {
        let color = getRandomColor();
        while (acc.indexOf(color) > -1) {
          color = getRandomColor();
        }
        return acc.concat(color);
      }, [getRandomColor()]);
      window.localStorage.colors = JSON.stringify(this.randomColors);
    }

    this.state = { names, moveMode: false };
  }

  addCard = (cardText, boardIndex, cardIndex) => {
    if (boardIndex >= this.boardRefs.length || boardIndex < 0) {
      alert("There are no boards in that direction");
      return false;
    }
    return this.boardRefs[boardIndex].addCard(cardText, cardIndex);
  }
  
  moveMode = (toggle, card) => {
    if (toggle === 'on') {
      this.setState({ ...this.state, ...{ moveMode: true }});
    } else if (toggle === 'off') {
      
      if (!this.hoveredBoard || !this.hoveredBoard.state.activeCard || !card) {
        this.setState({ ...this.state, ...{ moveMode: false }});
        return false;
      }

      const targetBoard = this.boardRefs[this.hoveredBoard.props.index];
      if (targetBoard.props.index === card.props.boardIndex) {
        targetBoard.removeCard(card.props.index);
        this.setState({ ...this.state, ...{ moveMode: false }});
        return targetBoard.addCard(card.props.name, this.hoveredBoard.state.activeCard.props.index + 1);
      }
      
      let success = this.addCard(card.props.name, this.hoveredBoard.props.index, this.hoveredBoard.state.activeCard.props.index + 1);

      if (success) {
        this.boardRefs[card.props.boardIndex].removeCard(card.props.index);
      } else {
        card.resetCard();
      }

      this.setState({ ...this.state, ...{ moveMode: false }});
      return true;
    } else {
      return this.state.moveMode;
    }
  }

  setHoveredBoard = (board) => {
    return () => {
      this.hoveredBoard = board;
    }
  }

  removeHoveredBoard = (board) => {
    return () => {
      if (this.hoveredBoard === board) this.hoveredBoard = null;
    }
  }

  render() {
    return (
      <div style={appStyles()}>
        { this.state.names.map( this.renderBoard )}
      </div>
    );
  }

  renderBoard = (name, index) => {
    return <Board
      setHoveredBoard={this.setHoveredBoard}
      removeHoveredBoard={this.removeHoveredBoard} 
      moveMode={this.moveMode}
      headerColor={this.randomColors[index]}
      firstBoard={index === 0}
      lastBoard={index + 1 === this.state.names.length}
      index={index}
      ref={b => {this.boardRefs.push(b)}}
      addCard={this.addCard}
      key={name}
      name={name} />
  }
}

class Board extends Component {

  inputField;
  defaultCards = ['Grocery shopping', 'Repair your broken phone'];

  constructor(props) {
    super(props);
    let storedCards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    let cards = (storedCards[this.props.name]) ? storedCards[this.props.name] : this.defaultCards;
    this.state = { cards, addingCard: false, hovered: false };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.cards !== prevState.cards) {
      let cards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
      cards[this.props.name] = this.state.cards;
      window.localStorage.setItem('cards', JSON.stringify(cards));
    }
  }

  addCard = (text, index) => {
    if (this.state.cards.indexOf(text) > -1) {
      alert("This card already exists on that board");
      return false;
    }
    if (index === undefined) index = this.state.cards.length
    let firstCards = this.state.cards.slice(0, index);
    let lastCards = this.state.cards.slice(index, this.state.cards.length);
    let cards = firstCards.concat(text).concat(lastCards);
    this.setState({ ...this.state, ...{ cards, addingCard: false, activeCard: null }});
    return true;
  }

  removeCard = (index) => {
    const firstCards = this.state.cards.slice(0, index);
    const lastCards = this.state.cards.slice(index + 1, this.state.cards.length);
    const cards = firstCards.concat(lastCards); 
    this.setState({ ...this.state, ...{ cards }});
  }

  renderWithAddCardField = () => {
    this.setState({ ...this.state, ...{ addingCard: true }});
  }

  cancelAction = () => {
    this.setState({ ...this.state, ...{ addingCard: false }});
  }

  handleKeyPress = (callback) => (e) => {
    if (e.keyCode === 13) {
      callback();
    } else if (e.keyCode === 27) {
      this.cancelAction();
    }
  }

  iconStyles = () => {
    let styles = iconStyles();
    styles.marginTop = "8px";
    styles.marginLeft = "5px";
    return styles;
  }

  removeHoveredCard = (card) => {
    return () => {
      if (this.props.moveMode() && this.state.activeCard === card) {
        this.setState({ ...this.state, ...{ activeCard: null } })
      }
    }
  }

  setHoveredCard = (card) => {
    return () => {
      if (this.props.moveMode()) {
        this.setState({ ...this.state, ...{ activeCard: card } });
      }
    }
  }

  moveCard = (card, boardIndex) => {
    if (boardIndex > -1) {
      const success = this.props.addCard(card.props.name, boardIndex);
      if (success) this.removeCard(card.props.index);
    }
  }

  submitCard = () => {
    if (this.inputField.value.length > 0) {
      this.props.addCard(this.inputField.value, this.props.index);
    }
  }

  renderCardField = () => {
    return (
      <div className='add-card-field'>
        <input autoFocus={true} onKeyUp={this.handleKeyPress(this.submitCard)} ref={b => {this.inputField = b}} style={{margin: "5px 0px"}} placeholder={"Enter card name"} />
        <br />
        <Button label="Submit" color={this.props.headerColor} clickHandler={this.submitCard} />
        <FontAwesomeIcon style={this.iconStyles()} onClick={this.cancelAction} icon={faTimesCircle} />
      </div>
    );
  }

  renderCard = (text, index) => {
    return <Card 
      setHoveredCard={this.setHoveredCard}
      removeHoveredCard={this.removeHoveredCard}
      moveMode={this.props.moveMode}
      boardIndex={this.props.index}
      removeCard={this.removeCard}
      index={index}
      needsLeftArrow={!this.props.firstBoard} 
      needsRightArrow={!this.props.lastBoard} 
      moveCard={this.moveCard} 
      moveCardLeft={this.moveCardLeft} 
      moveCardRight={this.moveCardRight} 
      key={text} 
      name={text} />
  }
  
  render() {
    return (
      <div className="board" move-mode={this.props.moveMode().toString()} onMouseEnter={this.props.setHoveredBoard(this)} onMouseLeave={this.props.removeHoveredBoard(this)} style={boardStyles()}>
        <h3 style={headerStyles(this.props.headerColor)}>{this.props.name}</h3>
        { this.state.cards.map(this.renderCard) }
        { (!this.state.addingCard) ? <Button label="Add a card" color={this.props.headerColor} clickHandler={this.renderWithAddCardField} /> : this.renderCardField() }
      </div>
    );
  }
}

class Button extends Component {
  constructor(props) {
    super(props);
    this.state = { hovered: false }
  }

  setStyle = () => {
    this.setState({ hovered: !this.state.hovered });
  }

  render() {
    const styles = {
      backgroundColor: (this.state.hovered) ? this.props.color.slice(0,7).concat('44') : "white",
      color: (this.state.hovered) ? 'rgb(120,120,120)' : 'black'
    }

    return (
      <button style={styles} onClick={this.props.clickHandler} onMouseLeave={this.setStyle} onMouseEnter={this.setStyle}>{this.props.label}</button>
      )
    }
}

class Card extends Component {

  rect;
  element;
  startingPoint;

  constructor(props) {
    super(props);
    this.state = { locked: false }
  }

  drag = (mouseMoveEvent) => {
    if (this.props.moveMode()) {
      this.element.style.pointerEvents = 'none';
      this.element.style.opacity = 0.4;
      this.element.style.width = this.rect.width + 'px';
      this.element.style.position = 'absolute';
      this.element.style.left = this.rect.left + mouseMoveEvent.pageX - this.startingPoint.x + 'px';
      this.element.style.top = this.rect.top + mouseMoveEvent.pageY - this.startingPoint.y + 'px';
    }
  }

  setCardPosition = (card, width, x, y) => {
    card.style.position = 'absolute';
    card.style.width = width + 'px';
    card.style.left = x + 'px';
    card.style.top = y + 'px';
  }

  resetCard = () => {
    this.element.style.pointerEvents = '';
    this.element.style.width = '';
    this.element.style.position = 'static';
    this.element.style.left = '';
    this.element.style.top = '';
    this.element.style.opacity = '';
  }

  lock = (e) => {
    e.preventDefault();
    this.element = e.currentTarget;
    this.rect = this.element.getBoundingClientRect();
    this.startingPoint = {
      x: e.pageX,
      y: e.pageY
    }
    this.element.classList.remove('card');
    this.placeHolderElement = e.currentTarget.cloneNode(true);
    this.placeHolderElement.style.opacity = 0.1;

    window.addEventListener('mouseup', this.unlock, true);
    this.timeout = setTimeout( () => {
      this.setCardPosition(this.element, this.rect.width, this.rect.left, this.rect.top);
      this.element.parentNode.insertBefore(this.placeHolderElement, this.element.nextSibling);
      window.addEventListener('mousemove', this.drag, true);
      this.props.moveMode('on', this);
    }, 200);
  }

  unlock = (e) => {
    clearTimeout(this.timeout);
    window.removeEventListener('mousemove', this.drag, true);
    window.removeEventListener('mouseup', this.unlock, true);
    this.placeHolderElement.remove();
    if (this.startingPoint.x === e.pageX && this.startingPoint.y === e.pageY) {
      this.resetCard();
      this.props.moveMode('off');
    }
    if (this.props.moveMode()) {
      const success = this.props.moveMode('off', this);
      if (!success) this.resetCard();
    }
  }

  moveLeft = () => {
    this.props.moveCard(this, this.props.boardIndex - 1);
  }

  moveRight = () => {
    this.props.moveCard(this, this.props.boardIndex + 1);
  }

  moveCard = () => {
    this.props.moveCard(this);
  }

  renderLeftArrow = () => {
    return <FontAwesomeIcon style={iconStyles()} onClick={this.moveLeft} icon={faCaretLeft} />
  }

  renderRightArrow = () => {
    return <FontAwesomeIcon style={iconStyles()} onClick={this.moveRight} icon={faCaretRight} />
  }

  render() {
    return (
        <div className='card' style={cardStyles()} onMouseLeave={this.props.removeHoveredCard(this)} onMouseEnter={this.props.setHoveredCard(this)} onMouseDown={this.lock}>
          { (this.props.needsLeftArrow) ? this.renderLeftArrow() : <span/> }
          <span style={{cursor: "pointer", margin: "10px 10px"}}>{this.props.name}</span>
          { (this.props.needsRightArrow) ? this.renderRightArrow() : <span/> }
        </div>
      )
  }
}

export default App;
