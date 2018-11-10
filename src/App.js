import React, { Component } from 'react';
import './App.css';

// NOTE: Please build this kanban board from scratch without pre-built components such as react-trello...

// 1. Create a list of 4 boards with 2 default items in each list.
// 2. Style boards according to the png provided.
// 3. Create the functionality to add a task to each list.
// 4. Create the buttons and functionality to move cards from one list to another.
// 5. Persist cards in the browser.

class App extends Component {
  boardRefs = [];
  randomColors = [];

  constructor(props) {
    super(props);
    const names = (this.props.names) ? this.props.names : ['Derrick', 'Maxwell', 'Zaza', 'Sam'];
    this.state = { names };
  }

  getRandomColor = () => {
    let color;

    while (!color || this.randomColors.indexOf(color) >= 0) {
      color = '#';
      const letters = '0123456789ABCDEF';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
    }
    this.randomColors.push(color);
    return color + 'AA';
  }

  moveCard = (card, index, direction) => {

    if (index + direction >= this.boardRefs.length || index + direction < 0) {
      alert("There are no boards in that direction");
      return false;
    }

    const targetBoard = this.boardRefs[index + direction];

    if (targetBoard.state.cards.indexOf(card.props.name) > -1) {
      alert("This card already exists on that board");
      return false;
    }

    
    targetBoard.setState(Object.assign(targetBoard.state, {cards : targetBoard.state.cards.concat(card.props.name)} ));
    return true;
  }

  render() {
    return (
      <div style={styles.app}>
        { this.state.names.map( this.renderBoard )}
      </div>
    );
  }

  renderBoard = (name, index) => {
    return <Board getRandomColor={this.getRandomColor} firstBoard={index === 0} lastBoard={index + 1 === this.state.names.length} index={index} ref={b => {this.boardRefs.push(b)}} moveCard={this.moveCard} key={name} name={name} />
  }
}

class Board extends Component {

  boardStyles = { 
    margin: "5px 0px",
    backgroundColor: "rgb(242,242,242)",
    textAlign: "center", 
    minWidth: 300,
    border: "3"
  }
  
  headerStyles = {
    color: "white",
    margin: "0"
  }

  defaultCards = ['Grocery shopping', 'Repair your broken phone']

  constructor(props) {
    super(props);
    this.headerStyles.backgroundColor = this.props.getRandomColor();
    let storedCards = (window.localStorage.cards) ? JSON.parse(window.localStorage.cards) : {};
    let cards = (storedCards[this.props.name]) ? storedCards[this.props.name] : this.defaultCards;
    this.state = { cards: cards, addingCard: false, newCardValue: "" };
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
    const success = this.props.moveCard(card, this.props.index, direction);
    if (success) {
      const index = this.state.cards.indexOf(card.props.name);
      this.state.cards.splice(index, 1);
      this.setState(Object.assign(this.state, { cards: this.state.cards  }));
    }
  }

  submitCard = () => {
    if (this.state.newCardValue.length > 0) {
      this.setState(Object.assign(this.state, {
        cards: this.state.cards.concat(this.state.newCardValue),
        addingCard: false
      }));
    } else {
      this.setState(Object.assign(this.state, {
        addingCard: false
      }));
    }
  }

  updateNewCardValue = (evt) => {
    this.setState(Object.assign(this.state, { newCardValue: evt.target.value }));
  }

  renderCardField = () => {
    return (
      <div>
        <input style={{margin: "5px 0px"}} onChange={this.updateNewCardValue} placeholder={"Enter card name"} />
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
      <div style={this.boardStyles}>
        <h3 style={this.headerStyles}>{this.props.name}</h3>
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

  render() {
    return (
      <div style={this.styles}>
        { (!this.props.onFirstBoard) ? <span style={{cursor: "pointer"}} onClick={this.moveLeft}>{"<="}</span> : <span/> }
        <span style={{padding: "0px 10px"}}>{this.props.name}</span>
        { (!this.props.onLastBoard) ? <span style={{cursor: "pointer"}} onClick={this.moveRight}>{"=>"}</span> : <span/> }
      </div>
    )
  }
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    padding: 25 / 2,
  },
}

export default App;
