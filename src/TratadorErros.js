import PubSub from 'pubsub-js';

class TratadorErros {

    publicErros(resposta) {
        resposta.errors.forEach(e => PubSub.publish("erro-validacao", e));
    }
}

export default TratadorErros;
