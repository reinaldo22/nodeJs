//Rotas de administração do site
const express = require('express');
const rota = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Agenda");
const Agenda = mongoose.model("agendas");
const { eAdmin } = require("../helpers/eAdmin");
require("../models/Usuario")



//Definições das rotas de admin 
rota.get('/', eAdmin, (req, res) => {
    Categoria.find().sort({ Date: 'desc' }).then((categorias) => {
        res.render("admin/index", { categorias: categorias });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    });
});
//Rota de posts
rota.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina de posts");
});
//Rota de categorias
rota.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/categorias", { categorias: categorias });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    });

});
//adiciona uma nova categoria
rota.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

//Edita uma nova categoria pelo id
rota.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria });

    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    })

});
//Edita informação da categoria
rota.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria");
            res.redirect("/admin/categorias");
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
    })
})
//Deleta uma categoria
rota.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deteada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar categoria");
        res.redirect("/admin/categorias");
    })

})

//Rota que insere informações no banco
rota.post("/categorias/nova", eAdmin, (req, res) => {


    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {

        erros.push({ texto: "Verifique os campos" });

    } if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    } if (req.body.nome.length < 2) {
        erros.push({ texto: "nome da categoria é muito pequeno" })
    } if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros });
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");

        });
    }
});

//Rota de postagem
rota.get("/agendas", eAdmin, (req, res) => {

    Agenda.find().populate("categoria").sort({ data: "desc" }).then((agendas) => {
        res.render("admin/agendas", { agendas: agendas });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens");
        res.redirect("/admin");
    });
});

rota.get("/agendas/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addagenda", { categorias: categorias });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin");
    });

});

rota.post("/agendas/nova", eAdmin, (req, res) => {
    var erros = [];

    if (req.body.categoria == null) {
        erros.push({ texto: "Categoria inválida, registre uma categoria" })
    } if (erros.length > 0) {
        res.render("admin/addagendas", { erros: erros });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
        }
        new Agenda(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/agendas");
        }).catch((err) => {
            req.flash("error_msg", "Erro inesperado, verifique os campos");
            res.redirect("/admin/agendas");
        });

    }

});

rota.post("/agendas/deletar/:id", eAdmin, (req, res) => {
    Agenda.deleteOne({ _id: req.params.id }).then((agendas) => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/agendas", { agendas: agendas });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar categoria");
        res.redirect("/admin/agendas");
    })

});

rota.get("/agendas/edit/:id", eAdmin, (req, res) => {
    Agenda.findOne({ _id: req.params.id }).then((agenda) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editagenda", { categorias: categorias, agenda: agenda });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/agendas");
        });
    });

});

rota.post("/agenda/edit", eAdmin, (req, res) => {

    Agenda.findOne({ _id: req.body.id }).then((agenda) => {

        Agenda.titulo = req.body.titulo
        Agenda.slug = req.body.slug
        Agenda.descricao = req.body.descricao
        Agenda.conteudo = req.body.conteudo
        Agenda.categoria = req.body.categoria

        Agenda.save().then(() => {
            req.flash("success", "Postagem editada com sucesso");
            res.redirect("/admin/agendas");
        }).catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect("/admin/agendas");
        });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        res.redirect("/admin/agendas");
    })

});


module.exports = rota;