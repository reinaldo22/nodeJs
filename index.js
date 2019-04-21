//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const admin = require('./rotas/admin');
const usuarios = require('./rotas/usuario');
const clientes = require('./rotas/cliente');
const path = require("path");
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Agenda");
const Agenda = mongoose.model("agendas");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const passport = require("passport");
require("./config/auth")(passport);
require("./helpers/eAdmin");



//Configurações
//Sessão
app.use(session({
    secret: "cw2esqu30",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())




app.use(flash());
//midleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    //res.locals.user = req.user.admin == 1;
    next();
});
//body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');



//Mongoose conectando ao banco
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/salaoapp").then(() => {
    console.log("Conectado ao mongo");
}).catch((err) => {
    console.log("Erro ao se conectar: " + err);
});






//Dizendo ao express onde esta arquivos staticos
app.use(express.static(path.join(__dirname, "public")));



//rotas
app.get("/", (req, res) => {
    Agenda.find().populate("categoria").sort({ data: "desc" }).then((agendas) => {
        res.render("index", { agendas: agendas });
    }).catch((err) => {
        req.flash("error-msg", "Houve um erro interno");
        res.redirect("/404");
    });

});

app.get('/categorias', (req, res) => {

    Categoria.find().then((categorias) => {
        res.render("categoria/index", { categorias: categorias });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    });
});


app.get("/categorias/:slug", (req, res) => {

    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {

            Agenda.find({ categoria: categoria._id }).then((agendas) => {

                res.render("categoria/agendas", { agendas: agendas, categoria: categoria });

            }).catch((err) => {

                req.flash("error_msg", "Houve um erro ao listar os posts");
                res.redirect("/");
            });

        } else {
            req.flash("error_msg", "Esta categoria não existe");
            res.redirect("/");

        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
        res.redirect("/");
    });
});



app.get("/agenda/:slug", (req, res) => {

    Agenda.findOne({ slug: req.params.slug }).then((agenda) => {
        if (agenda) {
            res.render("agenda/index", { agenda: agenda });
        } else {
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/");

        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
    });
});




app.get("/404", (req, res) => {
    res.send('ERRO 404!');
});

//Chama a pasta rota admin
app.use('/admin', admin);

//Chama a pasta rota usuario
app.use("/usuarios", usuarios);

app.use("/clientes", clientes);

//Config servidor
const PORTA = 8080;
app.listen(PORTA, () => {
    console.log("Servidor Rodando!");
})
