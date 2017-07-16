import React, {Component} from 'react';
import PubSub from 'pubsub-js';
import InputCustomizado from './components/InputCustomizado';
import TratadorErros from "./TratadorErros";

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: '',
        };
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        PubSub.publish("limpa-erros", {});
        fetch("http://cdc-react.herokuapp.com/api/autores", {
            headers: {'Content-type': 'application/json'},
            method: 'post',
            body: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
        }).then(res => {
            if (res.ok) {
                res.json()
                    .then(resposta => PubSub.publish('atualiza-lista-autores', resposta))
                    .then(() => this.setState({nome:'',email:'',senha:''}));
            } else if (res.status === 400) {
                res.json()
                    .then(resposta => new TratadorErros().publicErros(resposta));
            }
        }).catch(error => console.log(error));
    }

    setNome(evento) {
        this.setState({nome: evento.target.value});
    }

    setEmail(evento) {
        this.setState({email: evento.target.value});
    }

    setSenha(evento) {
        this.setState({senha: evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome}
                                      onChange={this.setNome} label="Nome"/>
                    <InputCustomizado id="email" type="email" name="email" value={this.state.email}
                                      onChange={this.setEmail} label="Email"/>
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha}
                                      onChange={this.setSenha} label="Senha"/>

                    <div className="pure-control-group">
                        <label/>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>
            </div>
        );
    }
}

class TabelaAutores extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(autor => (
                            <tr key={autor.id}>
                                <td>{autor.nome}</td>
                                <td>{autor.email}</td>
                            </tr>)
                        )
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

class AutorBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: [],
        };
    }

    componentDidMount() {
        fetch("http://cdc-react.herokuapp.com/api/autores")
            .then(res => {
                if (res.ok) {
                    res.json()
                        .then(resposta => this.setState({lista: resposta}));
                }
            });

        PubSub.subscribe('atualiza-lista-autores', (topico, novaLista) => this.setState({lista: novaLista}));
    }

    render() {
        return (
            <div>
                <FormularioAutor/>
                <TabelaAutores lista={this.state.lista}/>
            </div>
        );
    }
}

export default AutorBox;
