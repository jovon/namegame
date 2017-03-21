'use strict';

var items,
    pickAnswer,
    pickChoices,
    getRandomInt,
    maxIndex,
    pickAnswer,
    pickRandomIndex,
    maxChoices = 5;



function Name(props) {
    let fName = '';
    let lName = '';
    if (props.value.item){
        fName = props.value.item.firstName;
        lName = props.value.item.lastName;
    }
    return(
        <h2 id="name" className="well">
            {fName + ' ' + lName}
        </h2>
    );
}

function Face(props) {
    let value = [];
    if(props.value) {
        value = props.value;
    }
    return(
        <button className="face" id={value.index} onClick={() => props.onClick()}>
            <img src={value.img} />
        </button>
    );
}

function Next(props) {
    return(
        <button id="next" type="button" className="btn btn-primary btn-lg" onClick={() => props.onClick()}>
            Next
        </button>
    )
}

class Faces extends React.Component {
    renderFace(i) {
        let imgLocation = '';
        if(this.props.value && this.props.value.length === maxChoices) {
            if(this.props.value[i] !== undefined){
                imgLocation = this.props.value[i].headshot.url;
            } else {
                imgLocation = "";
            }
        }
        let value = {img: imgLocation, index: i};
        return <Face value={value} onClick={() => this.props.onClick(i)}/>;
    }
    render() {
        return (
            <div className="faces">
                {this.renderFace(0)}
                {this.renderFace(1)}
                {this.renderFace(2)}
                {this.renderFace(3)}
                {this.renderFace(4)}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: {
                right: 0,
                wrong: 0,
            },
            data: [],
            choices: [],
            maxIndex: 0,
            correctlyAnswered: false,
            answer: {}
        }
        fetch("https://willowtreeapps.com/api/v1.0/profiles/")
            .then( (response) => {
                return response.json() })   
                    .then( (json) => {
                        this.setState({data: json.items, maxIndex: json.items.length - 1});
                    });

    }
    handleChoiceClick(i) {
        let rightNum = this.state.history.right;
        let wrongNum = this.state.history.wrong;
        let correctlyAnswered = this.state.correctlyAnswered;
        if(correctlyAnswered === false) {
            if(i === this.state.answer.index){
                rightNum++;
                correctlyAnswered = true;
                $('.face').prop("disabled", true);
            } else {
                wrongNum++;
                $('#'+i).prop("disabled", true);
                this.setState({history});
            }
        }
        this.setState({history: {right: rightNum, wrong: wrongNum}, correctlyAnswered: correctlyAnswered})
    }
    handleNextClick(){
        this.getChoices();
        this.setState({correctlyAnswered: false});
        $('.face').prop('disabled', false);
    }
    // Creates an object with the selected people
    getChoices() {
        var choicesIndexes = this.pickChoices();
        var results = {};
        var choices = []
        for(let i = 0; i <= maxChoices - 1; i++) {
            choices.push(this.state.data[choicesIndexes[i]]);
        }
        results.choices = choices;
        var answer = this.pickAnswer(choices);
        this.setState({choices: choices, 
                       answer: {index: answer, 
                                item: choices[answer]}});

    }
    // Picks 5 random integers to be indexes of the items array
    //   which represent the possibles choices.
    pickChoices (chosenIndexes = []) {
        var max = this.state.maxIndex;
        for(let i = 0; i <= maxChoices - 1; i++) {
            var indx = this.pickRandomIndex(max)
            if(!this.isChosen(indx, chosenIndexes)){
                chosenIndexes.push(indx);
            }
        }
        return chosenIndexes;
    }

    // Return a random integer with the index in the items array 
    // Arguments:
    //      maxIndex = the highest possible index of the items array
    pickRandomIndex (max) {
        return this.getRandomInt(0, max);
    }

    // Selects a random integer between 0 and the maximum index of the items array
    getRandomInt (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Returns the index of the randonly pick answer
    pickAnswer (choices) {
        return this.pickRandomIndex(choices.length - 1); 
    }


    // Was this index already chosen?
    isChosen (indx, chosenIndexes) {
        return undefined !== chosenIndexes.find(function(v){
            return v === indx;
        })
    }

    render() {
        if(this.state.maxIndex > 0 && this.state.choices.length === 0) {
            this.getChoices();
        }

        return (
            <div className="game">
                <div className="question">
                    <h1>Who is?</h1>
                    <Name value={this.state.answer || {}} />
                </div>
                <Faces value={this.state.choices || []} onClick={(i)=> this.handleChoiceClick(i)}/>
                <div className="history">
                    <div id="right">Right:  {this.state.history.right}</div>
                    <div id="wrong">Wrong: {this.state.history.wrong}</div>
                 </div>
                 <div className="next">
                     <Next onClick={()=> this.handleNextClick()} />
                 </div>

            </div>
        );

    }
}

ReactDOM.render(<Game />, document.getElementById('container'));
