const express = require("express");
const router = express.Router();
const monk = require("monk");
const joi = require("joi");

const db = monk(process.env.MONGO_URI);

const faqs = db.get("faqs");

const schema = joi.object({
    cod: joi.number().integer().min(1).max(10).required(),
    question: joi.string().trim().required(),
    answer: joi.string().trim().required(),
});

//Leer Todo
router.get("/", async (req, res, next) => {
    try {
        const items = await faqs.find({});
        res.json(items);
    } catch (error) {
        next(error);
    }
});

//Leer Uno
router.get("/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    await faqs
        .find({ cod: id })
        .then((data) => {
            if (data == 0) {
                res.status(404).send({
                    message: "No hay datos con el id",
                });
            } else {
                res.status(200).send(data);
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Ocurrio un error" || err.message,
            });
        });
});

//Crear Uno
router.post("/", async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);
        const inserted = await faqs.insert(value);
        res.json(inserted);
    } catch (error) {
        next(error);
    }
});

//Actualizar uno
router.put("/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
        await faqs
            .update(
                { cod: id },
                {
                    $set: {
                        question: req.body.question,
                        answer: req.body.answer,
                    },
                }
            )
            .then((data) => {
                if (data.n !== 0) {
                    res.status(200).send({
                        message: "Actualizado",
                    });
                } else {
                    res.status(500).send({
                        message: "id no encontrado",
                    });
                }
            });
    } catch (error) {
        res.status(500).send(error);
    }
});

//Borrar Uno
router.delete("/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
        await faqs.remove({ cod: id });
        res.json({
            message: "Eliminado correctamente",
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
