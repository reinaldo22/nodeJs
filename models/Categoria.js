const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Mapeamento do banco de dados com o mongoose
const Categoria = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }

});
//Passa o nome da collection(tabela) para o banco
mongoose.model("categorias", Categoria);