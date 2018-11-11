import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft, faCaretRight, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import './App.css';

class App extends Component {
  boardRefs = [];
  randomColors = [];

  constructor(props) {
    super(props);
    const names = (this.props.names) ? this.props.names : ['Derrick', 'Maxwell', 'Zaza', 'Sam'];
    this.state = { names };
  }

  addCard = (cardText, boardIndex) => {
    if (boardIndex >= this.boardRefs.length || boardIndex < 0) {
      alert("There are no boards in that direction");
      return false;
    }

    const targetBoard = this.boardRefs[boardIndex];

    if (targetBoard.state.cards.indexOf(cardText) > -1) {
      alert("This card already exists on that board");
      return false;
    }
    
    targetBoard.setState(Object.assign(targetBoard.state, {cards : targetBoard.state.cards.concat(cardText)} ));
    return true;
  }

  getBoardIndex = (name) => {
    return this.boardRefs.findIndex( (board) => board.props.name.toLowerCase() === name.toLowerCase() );
  }

  render() {
    return (
      <div style={appStyles()}>
        { this.state.names.map( this.renderBoard )}
      </div>
    );
  }

  renderBoard = (name, index) => {
    const randomColor = getRandomColor(this.randomColors);
    this.randomColors.push(randomColor);
    return <Board 
      headerColor={randomColor} 
      firstBoard={index === 0} 
      lastBoard={index + 1 === this.state.names.length} 
      index={index}
      ref={b => {this.boardRefs.push(b)}} 
      addCard={this.addCard} 
      getBoardIndex={this.getBoardIndex}
      key={name} 
      name={name} />
  }
}

class Board extends Component {

  inputField;
  defaultCards = ['Grocery shopping', 'Repair your broken phone']

  constructor(props) {
    super(props);
    let storedCards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    let cards = (storedCards[this.props.name]) ? storedCards[this.props.name] : this.defaultCards;
    this.state = { cards: cards, addingCard: false, movingCard: null };
  }

  componentWillUpdate = () => {
    let cards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    cards[this.props.name] = this.state.cards;
    window.localStorage.setItem( 'cards', JSON.stringify(cards));
  }

  addCard = () => {
    this.setState(Object.assign(this.state, { addingCard: true }));
  }

  cancelAction = () => {
    this.setState(Object.assign(this.state, { movingCard: false, addingCard: false }));
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

  moveCard = (card, boardIndex) => {
    if (boardIndex > -1) {
      const success = this.props.addCard(card.props.name, boardIndex);
      if (success) {
        const index = this.state.cards.indexOf(card.props.name);
        this.state.cards.splice(index, 1);
        this.setState(Object.assign(this.state, { cards: this.state.cards, movingCard: false  }));
      }
    } else {
      this.setState(Object.assign(this.state, { movingCard: card }))
    }
  }

  moveCardtoSpecificBoard = () => {
    if (this.inputField.value.length > 0) {
      let boardIndex = this.props.getBoardIndex(this.inputField.value);
      if (boardIndex > -1) {
        this.moveCard(this.state.movingCard, boardIndex);
      } else {
        alert('Board does not exist');
      }
    }
  }

  submitCard = () => {
    if (this.inputField.value.length > 0) {
      this.props.addCard(this.inputField.value, this.props.index, 0);
      this.setState(Object.assign(this.state, { addingCard: false }));
    }
  }

  renderCardField = () => {
    return (
      <div>
        <input autoFocus={true} onKeyUp={this.handleKeyPress(this.submitCard)} ref={b => {this.inputField = b}} style={{margin: "5px 0px"}} placeholder={"Enter card name"} />
        <br />
        <button style={{cursor: "pointer", margin: "5px 0px"}} onClick={this.submitCard}>Submit</button>
        <FontAwesomeIcon style={this.iconStyles()} onClick={this.cancelAction} icon={faTimesCircle} />
      </div>
    );
  }

  renderCard = (text) => {
    return <Card boardIndex={this.props.index} needsLeftArrow={!this.props.firstBoard} needsRightArrow={!this.props.lastBoard} moveCard={this.moveCard} moveCardLeft={this.moveCardLeft} moveCardRight={this.moveCardRight} key={text} name={text} />
  }

  renderNormalBoard = () => {
    return (
      <div style={boardStyles()}>
        <h3 style={headerStyles(this.props.headerColor)}>{this.props.name}</h3>
        { this.state.cards.map(this.renderCard) }
        { (!this.state.addingCard) ? <button style={{cursor: "pointer", margin: "5px 0px"}} onClick={this.addCard}>Add a card</button> : this.renderCardField() }
      </div>
    );
  }

  renderMovingCardBoard = () => {
    const text = this.state.movingCard.props.name;
    return (
      <div style={boardStyles()}>
        <h3 style={headerStyles(this.props.headerColor)}>{this.props.name}</h3>
        <Card boardIndex={this.props.index} needsLeftArrow={false} needsRightArrow={false} moveCard={this.moveCard} key={text} name={text} />
        <div>
          <input autoFocus={true} onKeyUp={this.handleKeyPress(this.moveCardtoSpecificBoard)} ref={b => {this.inputField = b}} style={{margin: "5px 0px"}} placeholder={"Enter a board name"} />
          <br />
          <button style={{margin: "5px 0px"}} onClick={this.moveCardtoSpecificBoard}>Move Card</button>
          <FontAwesomeIcon style={this.iconStyles()} onClick={this.cancelAction} icon={faTimesCircle} />
        </div>
      </div>
    );
  }
  
  render() {
    return (this.state.movingCard) ? this.renderMovingCardBoard() : this.renderNormalBoard()
  }
}

class Card extends Component {
  
  styles = {
    padding: "5px 0px"
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
      <div style={this.styles}>
        { (this.props.needsLeftArrow) ? this.renderLeftArrow() : <span/> }
        <span onClick={this.moveCard} style={{cursor: "pointer", margin: "10px 10px"}}>{this.props.name}</span>
        { (this.props.needsRightArrow) ? this.renderRightArrow() : <span/> }
      </div>
    )
  }
}

const getRandomColor = (colors) => {
  let color;

  while (!color || colors.indexOf(color) >= 0) {
    color = '#';
    const letters = '0123456789ABCDEF';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  }
  return color + 'AA';
}

const iconStyles = () => {
  return {cursor: "pointer", fontSize: "13px"}
}

const headerStyles = (color) => {
  let styles = {
    backgroundColor: color,
    color: "white",
    margin: "0"
  }
  return styles;
}

const boardStyles = () => {
  let styles = { 
    margin: "5px 0px",
    backgroundColor: "rgb(242,242,242)",
    textAlign: "center", 
    minWidth: 300,
    border: 3,
    borderStyle: "groove",
    borderRadius: "10px",
    overflow: "hidden"
  }
  return styles;
}

const appStyles = () => {
  let styles = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    padding: 25 / 2,
  }
  return styles;
}

export default App;
