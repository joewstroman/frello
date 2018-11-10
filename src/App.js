import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import './App.css';

class App extends Component {
  boardRefs = [];
  randomColors = [];

  constructor(props) {
    super(props);
    const names = (this.props.names) ? this.props.names : ['Derrick', 'Maxwell', 'Zaza', 'Sam'];
    this.state = { names };
  }

  addCard = (cardText, index, direction) => {

    if (index + direction >= this.boardRefs.length || index + direction < 0) {
      alert("There are no boards in that direction");
      return false;
    }

    const targetBoard = this.boardRefs[index + direction];

    if (targetBoard.state.cards.indexOf(cardText) > -1) {
      alert("This card already exists on that board");
      return false;
    }
    
    targetBoard.setState(Object.assign(targetBoard.state, {cards : targetBoard.state.cards.concat(cardText)} ));
    return true;
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
    return <Board headerColor={randomColor} firstBoard={index === 0} lastBoard={index + 1 === this.state.names.length} index={index} ref={b => {this.boardRefs.push(b)}} addCard={this.addCard} key={name} name={name} />
  }
}

class Board extends Component {

  defaultCards = ['Grocery shopping', 'Repair your broken phone']

  inputField;

  constructor(props) {
    super(props);
    let storedCards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    let cards = (storedCards[this.props.name]) ? storedCards[this.props.name] : this.defaultCards;
    this.state = { cards: cards, addingCard: false };
  }

  componentWillUpdate = () => {
    let cards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    cards[this.props.name] = this.state.cards;
    window.localStorage.setItem( 'cards', JSON.stringify(cards));
  }

  addCard = () => {
    this.setState(Object.assign(this.state, { addingCard: true }));
  }

  moveCard = (card, direction) => {
    const success = this.props.addCard(card.props.name, this.props.index, direction);
    if (success) {
      const index = this.state.cards.indexOf(card.props.name);
      this.state.cards.splice(index, 1);
      this.setState(Object.assign(this.state, { cards: this.state.cards  }));
    }
  }

  submitCard = () => {
    this.props.addCard(this.inputField.value, this.props.index, 0);
    this.setState(Object.assign(this.state, { addingCard: false }));
  }

  renderCardField = () => {
    return (
      <div>
        <input ref={b => {this.inputField = b}} style={{margin: "5px 0px"}} placeholder={"Enter card name"} />
        <br />
        <button style={{margin: "5px 0px"}} onClick={this.submitCard}>Submit</button>
      </div>
    );
  }

  renderCard = (text) => {
    return <Card onFirstBoard={this.props.firstBoard} onLastBoard={this.props.lastBoard} moveCard={this.moveCard} key={text} name={text} />
  }
  
  render() {
    return (
      <div style={boardStyles()}>
        <h3 style={headerStyles(this.props.headerColor)}>{this.props.name}</h3>
        { this.state.cards.map(this.renderCard) }
        { (!this.state.addingCard) ? <button style={{margin: "5px 0px"}} onClick={this.addCard}>Add a card</button> : this.renderCardField() }
      </div>
    );
  }
}

class Card extends Component {
  
  styles = {
    padding: "5px 0px"
  }

  moveLeft = () => {
    this.props.moveCard(this, -1);
  }

  moveRight = () => {
    this.props.moveCard(this, 1);
  }

  renderLeftArrow = () => {
    return <FontAwesomeIcon style={{cursor: "pointer", fontSize: "12px"}} onClick={this.moveLeft} icon={faArrowLeft} />
  }

  renderRightArrow = () => {
    // return <span style={{cursor: "pointer"}} onClick={this.moveRight}>{"=>"}</span>
    return <FontAwesomeIcon style={{cursor: "pointer", fontSize: "12px"}} onClick={this.moveRight} icon={faArrowRight} />
  }

  render() {
    return (
      <div style={this.styles}>
        { (!this.props.onFirstBoard) ? this.renderLeftArrow() : <span/> }
        <span style={{padding: "0px 10px"}}>{this.props.name}</span>
        { (!this.props.onLastBoard) ? this.renderRightArrow() : <span/> }
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
