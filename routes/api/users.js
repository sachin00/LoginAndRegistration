const express = require('express')
const { check,validationResult } = require('express-validator')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')
const config = require('../../config/default.json')

const User = require('../../models/User')

//Register user
router.post('/register', 
[
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({ min:6 })
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }

        user = new User({
            name,
            email,
            password
        })
        
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.jwtSecret, {expiresIn: 3600}, (err, token) => {
            if (err)
                throw err;
            
            res.json({ token })
        })
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

//Login user and get token
router.post('/login', 
[
    check('email','Please include a valid email').isEmail(),
    check('password','Password is required').exists()
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.jwtSecret, {expiresIn: 3600}, (err, token) => {
            if (err)
                throw err;
            
            res.json({ token })
        })
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

//Get current users profile
router.get('/get-profile', auth,  async (req, res) => {
    try {
        const profile = await User.findOne({ _id : req.user.id })
        
        if (!profile) {
            res.status(400).json({ msg: 'There is no profile for this user'});
        }

        res.json(profile);
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router