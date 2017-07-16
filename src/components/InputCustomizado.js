import React, {Component} from 'react';
import PubSub from 'pubsub-js';

class InputCustomizado extends Component {

    constructor() {
        super();
        this.state = {
            msgErro: '',
        };
    }

    componentDidMount() {
        PubSub.subscribe("erro-validacao", (topico, erro) => {
            if (erro.field === this.props.name) {
                this.setState({msgErro: erro.defaultMessage});
            }
        });
        PubSub.subscribe("limpa-erros", topico => this.setState({msgErro: ''}));
    }

    render() {
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input id={this.props.id} type={this.props.type} name={this.props.name}
                       value={this.props.value} onChange={this.props.onChange}/>
                <span className="error">{this.state.msgErro}</span>
            </div>
        );
    }
}

export default InputCustomizado;
