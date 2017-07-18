import React, {Component} from "react";
import PubSub from 'pubsub-js';
import TratadorErros from "./TratadorErros";
import InputCustomizado from "./components/InputCustomizado";

class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = {
            titulo: '',
            preco: '',
            autorId: '',
        };
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        PubSub.publish("limpa-erros", {});
        fetch("http://cdc-react.herokuapp.com/api/livros", {
            headers: {'Content-type': 'application/json'},
            method: 'post',
            body: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
        }).then(res => {
            if (res.ok) {
                res.json()
                    .then(resposta => PubSub.publish('atualiza-lista-livros', resposta))
                    .then(() => this.setState({titulo: '', preco: '', autorId: ''}));
            } else if (res.status === 400) {
                res.json()
                    .then(resposta => new TratadorErros().publicErros(resposta));
            }
        }).catch(error => console.log(error));
    }

    salvaAlteracao(campo, evento) {
        this.setState({[campo]: evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo}
                                      onChange={this.salvaAlteracao.bind(this, "titulo")} label="Título"/>
                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco}
                                      onChange={this.salvaAlteracao.bind(this, "preco")} label="Preço"/>
                    <div className="pure-control-group">
                        <label htmlFor="autorId">AutorId</label>
                        <select id="autorId" value={this.state.autorId} onChange={this.salvaAlteracao.bind(this, "autorId")}>
                            <option value="">Selecione</option>
                            {
                                this.props.autores.map(autor => (
                                        <option key={autor.id} value={autor.id}>{autor.nome}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="pure-control-group">
                        <label/>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>
            </div>
        );
    }
}

class TabelaLivros extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Título</th>
                        <th>Preço</th>
                        <th>Autor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(livro => (
                            <tr key={livro.id}>
                                <td>{livro.titulo}</td>
                                <td>{livro.preco}</td>
                                <td>{livro.autor.titulo}</td>
                            </tr>)
                        )
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

class LivroBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: [],
            autores: [],
        };
    }

    componentDidMount() {
        fetch("http://cdc-react.herokuapp.com/api/livros")
            .then(res => {
                if (res.ok) {
                    res.json()
                        .then(resposta => this.setState({lista: resposta}));
                }
            });

        fetch("http://cdc-react.herokuapp.com/api/autores")
            .then(res => {
                if (res.ok) {
                    res.json()
                        .then(resposta => this.setState({autores: resposta}));
                }
            });

        PubSub.subscribe('atualiza-lista-livros', (topico, novaLista) => this.setState({lista: novaLista}));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <TabelaLivros lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}

export default LivroBox;
