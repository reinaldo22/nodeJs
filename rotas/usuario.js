const express = require('express');
const rota = express.Router();
const mongoose = require('mongoose');
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport")

rota.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

rota.get("/registro/admin", (req, res) => {
    res.render("usuarios/registro");
});

rota.get("/registro/cliente", (req, res) => {
    res.render("usuarios/registro");
});

rota.post("/registro", (req, res) => {
    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" });
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta!" });
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" });
    }
    if (erros.length > 0) {

        res.render("usuarios/registro", { erros: erros });

    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {

            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail no sistema");
                res.redirect("/usuarios/registro");

            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    //eAdmin: 1
                });

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Erro ao salvar usuário");
                            res.redirect("/");
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!");
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao salvar usuário, tente novamente!");
                            res.redirect("/usuarios/registro");
                        });

                    });
                });


            }


        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
    }


});

rota.get("/login", (req, res) => {
    res.render("usuarios/login");
});

rota.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)



});

rota.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Deslogado com sucesso!");
    res.redirect("/");
})

rota.get("/loginAdmin", (req, res) => {
    res.render("usuarios/loginAdmin");
});

rota.post("/loginAdmin", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/usuarios/loginAdmin",
        failureFlash: true
    })(req, res, next)
});


module.exports = rota;