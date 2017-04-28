
// Selects a random integer between 0 and the maximum index of the items array
function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

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

class Face extends React.Component{
    constructor(){
        super()
        this.state = {
            disabled: false,
        }
    }
    render() {
        let value = [];
        if(this.props.value) {
            value = this.props.value;
        }
        return(
            <button className="face" id={value.index} onClick={() => {this.props.onClick(); this.setState({disabled:true})} } disabled={this.state.disabled}>
                <img src={value.img} />
            </button>
        );
    }
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
        if(this.props.value) { 
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
        var obj = this;
        this.event = (e) => {
                if(e.keyCode === 49){
                    obj.handleChoiceClick(0);
                } 
                if(e.keyCode === 50) {
                    obj.handleChoiceClick(1);
                }
                if(e.keyCode === 51){
                    obj.handleChoiceClick(2);
                } 
                if(e.keyCode === 52){
                    obj.handleChoiceClick(3);
                } 
                if(e.keyCode === 53){
                    obj.handleChoiceClick()
                } 
                if(e.keyCode === 13){
                    obj.handleNextClick();
                }

            }
        
    }
    componentDidMount(){
        var obj = this;
        fetch("https://willowtreeapps.com/api/v1.0/profiles/")
            .then( (response) => {
                return response.json() })   
                    .then( (json) => {
                        this.setState({data: json.items, maxIndex: json.items.length - 1});
                        this.getChoices();
                    });

            window.addEventListener('keyup', this.event);
    }
    componentWillUnmount(){
        window.removeEventListener('keyup');
    }
    handleChoiceClick(i) {
        let rightNum = this.state.history.right;
        let wrongNum = this.state.history.wrong;
        let correctlyAnswered = this.state.correctlyAnswered;
        if(correctlyAnswered === false) {
            if(i === this.state.answer.index){
                rightNum++;
                correctlyAnswered = true;
            } else {
                wrongNum++;
            }
            this.setState({
                            history: {
                                right: rightNum, 
                                wrong: wrongNum
                            }, 
                            correctlyAnswered: correctlyAnswered
                            }
                        );
        }
    }
    handleNextClick(){
        this.getChoices();
        this.setState({correctlyAnswered: false});
    }
    // Creates an object with the chosen people
    getChoices(){
        let maxChoices = 5;
        let choicesIndexes = this.pickChoices(maxChoices);
        let choices = [];
        for(let i = 0; i < maxChoices; i++){
            choices.push(this.state.data[choicesIndexes[i]]);
        }
        
        let answer = this.pickAnswer(choices);
        this.setState({choices: choices, 
                       answer: {index: answer, 
                                item: choices[answer]}
                       });

    }
    // Picks 5 random integers to be indexes of the items array
    //   which represent the possibles choices.
    pickChoices (maxChoices) {
        let chosenIndexes = []
        let max = this.state.maxIndex;
        while(chosenIndexes.length < maxChoices){
            let indx = this.pickRandomIndex(max)
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
        return getRandomInt(0, max);
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
        return (
            <div className="game">
                <div className="question">
                    <h1>Who is?</h1>
                    <Name value={this.state.answer || {}} />
                </div>
                <Faces value={this.state.choices || []} onClick={(i)=> this.handleChoiceClick(i)}/>
                <div className="history">
                    <div id="right">Right: {this.state.history.right}</div>
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
