import React, { Component } from 'react';
import './App.css';
import{ ButtonToolbar, MenuItem, DropdownButton } from 'react-bootstrap';

class Box extends Component {
  constructor(props) {
    super(props);
    this.selectBox = this.selectBox.bind(this);
  }
  
  selectBox() {
    this.props.selectBox(this.props.row, this.props.col);
  }

  render() {
    return (
      <div className={this.props.boxClass}
           id={this.props.id}
           onClick={this.selectBox}
      />
    );
  }
}

class Grid extends Component {
  render() {
    const w = this.props.cols * 14;
    var rowsArr = [];
    var boxClass = "";

    for (var i = 0;i < this.props.rows;i++) {
      for (var j = 0;j < this.props.cols;j++) {
        let boxId = i + "_" + j;

        boxClass = this.props.grid[i][j] ? "box on" : "box off";
        rowsArr.push(
          <Box boxClass={boxClass} 
               key={boxId}
               boxId={boxId}
               row={i}
               col={j} 
               selectBox={this.props.selectBox}
          />
        );
      }
    }

    return (
      <div className="grid" style={{width: w}}>
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(e) {
    this.props.gridSize(e);
  }
  
  render() {
    return (
      <div className="center">
        <ButtonToolbar>
          <button className="btn btn-default" onClick={this.props.playButton}>Play</button>
          <button className="btn btn-default" onClick={this.props.pauseButton}>Pause</button>
          <button className="btn btn-default" onClick={this.props.slow}>Slow</button>
          <button className="btn btn-default" onClick={this.props.fast}>Fast</button>
          <button className="btn btn-default" onClick={this.props.clear}>Clear Grid</button>
          <button className="btn btn-default" onClick={this.props.seed}>Seed Grid</button>

          <DropdownButton
            title="Grid Size"
            id="size-menu"
            onSelect={this.handleSelect}
          >
            <MenuItem eventKey="1">20x10</MenuItem>
            <MenuItem eventKey="2">50x30</MenuItem>
            <MenuItem eventKey="3">70x50</MenuItem>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    
    this.speed = 100; // speed of the game
    this.rows = 30;
    this.cols = 50;
    this.selectBox = this.selectBox.bind(this);
    this.play = this.play.bind(this);
    this.playButton = this.playButton.bind(this);
    this.pauseButton = this.pauseButton.bind(this);
    this.slow = this.slow.bind(this);
    this.fast = this.fast.bind(this);
    this.clear = this.clear.bind(this);
    this.gridSize = this.gridSize.bind(this);
    this.seed = this.seed.bind(this);

    this.state = {
      generation: 0,
      grid: Array(this.rows).fill().map(() => Array(this.cols).fill(false)),
    }
  }

  selectBox(row, col) {
    let gridCopy = cloneArr(this.state.grid);
    gridCopy[row][col] = !gridCopy[row][col];
    this.setState({grid: gridCopy});
  }

  seed() {
    let gridCopy = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    for (var i = 0;i < this.rows;i++) {
      for (var j = 0;j < this.cols;j++) {
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true;
        }
      }
    }

    this.setState({grid: gridCopy});
  }

  play() {
    let g1 = this.state.grid;
    let g2 = cloneArr(this.state.grid); // mutate this copy

    for (var i = 0;i < this.rows;i++) {
      for (var j = 0;j < this.cols;j++) {
        let count = 0;

        if (i > 0) {
          if (g1[i - 1][j]) count++;
          if (j > 0 && g1[i - 1][j - 1]) count++;
          if (j < this.cols - 1 && g1[i - 1][j + 1]) count++;
        }

        if (j < this.cols - 1 && g1[i][j + 1]) count++;
        if (j > 0 && g1[i][j - 1]) count++;
        if (i < this.rows - 1) {
          if (g1[i + 1][j]) count++;
          if (j > 0 && g1[i + 1][j - 1]) count++;
          if (j < this.cols - 1 && g1[i + 1][j + 1]) count++;
        }
         
        if (g1[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        if (!g1[i][j] && count === 3) g2[i][j] = true;
      }
    }

    this.setState({
      generation: this.state.generation + 1,
      grid: g2,
    });
  }
  
  fast() {
    this.speed = 100;
    this.playButton();
  }

  slow() {
    this.speed = 1000;
    this.playButton();
  }

  clear() {
    this.pauseButton();
    var g = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    this.setState({
      generation: 0,
      grid: g,
    });
  }

  pauseButton() {
    clearInterval(this.timerId);
  }

  playButton() {
    clearInterval(this.timerId);
    this.timerId = setInterval(
      () => this.play(),
      this.speed
    );
  }

  gridSize(size) {
    if (size == 1) {
      this.rows = 10;
      this.cols = 20; 
    } else if (size == 2) {
      this.rows = 30;
      this.cols = 50;
    } else if (size == 3) {
      this.rows = 50;
      this.cols = 70;
    }
    this.clear();
  }

  componentDidMount() {
    this.seed(); // seeds grid when program starts
    // componentDidMount is kind of like an init function
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  render() {
    return (
      <div>
        <div className="banner">
          <h1 className="title">Conway's Game of Life</h1>
        </div>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />
        <Grid grid={this.state.grid} 
              rows={this.rows}
              cols={this.cols}
              selectBox={this.selectBox}
        />
        <h2 style={{"font-family": "Arial Black, Gadget, sans-serif"}}>Generations: {this.state.generation}</h2>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Main />
    );
  }
}

function cloneArr(a) {
  return JSON.parse(JSON.stringify(a));
  // have to use this approach instead of .slice() because
  // array is a NESTED array
}

export default App;
