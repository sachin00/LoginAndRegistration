const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const Article = require('../../models/Article')

const User = require('../../models/User')

//Create articles
router.post('/add-article', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newArticle = new Article({
            text: req.body.text,
            name: user.name,
            user: req.user.id
        });

        const article = await newArticle.save()

        res.json(article)
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//Get all posts
router.get('/get-articles', async (req, res) => {
    try {
        const articles = await Article.find().sort({ date: -1 });

        res.json(articles)
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//Delete a article
router.delete('/delete-article/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ msg: 'Article not found' })
        }

        // Check user
        if (article.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await article.remove();

        res.json({ msg: 'Article removed' })
    }
    catch (err) {
        console.error(err.message)

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Article not found' })
        }
        res.status(500).send('Server Error')
    }
})

//Update a article
router.put('/update-article/:id', [auth, 
    [check('text', 'Text is required').not().isEmpty()]], 
    async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ msg: 'Article not found' })
        }

        // Check user
        if (article.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await article.updateOne({ text: req.body.text });
        
        res.json({ msg: 'Article not found' })
    }
    catch (err) {
        console.error(err.message)

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Article not found' })
        }
        res.status(500).send('Server Error')
    }
})

module.exports = router