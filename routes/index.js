const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
var validator = require('validator');

var filter = require('bad-words');
var filter = new filter(); 
filter.addWords('kukhuvud');




const mysql = require('mysql2');
const session = require('express-session');

const pool = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

const promisePool = pool.promise();






router.get('/', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT al04forum.*, al04users.name FROM al04forum JOIN al04users WHERE al04forum.authorId = al04users.id ORDER BY createdAt DESC");
    res.render('index.njk', {
        rows: rows,
        title: 'Forum',
        loggedin: req.session.loggedin
    });
});


router.post('/new', async function (req, res, next) {
    const { author, title, content } = req.body;
    const errors = [];


    // Skapa en ny författare om den inte finns men du behöver kontrollera om användare finns!
    let [user] = await promisePool.query('SELECT * FROM al04users WHERE id = ?', [author]);
    if (!user) {
        user = await promisePool.query('INSERT INTO al04users (name) VALUES (?)', [author]);
    }

    // user.insertId bör innehålla det nya ID:t för författaren
    const userId = user.insertId || user[0].id;
    // validera title och body
    if (!title) errors.push('Title is required');
    if (!content) errors.push('content is required');
    if (title && title.length <= 3)
        errors.push('Title must be at least 3 characters');
    if (content && content.length <= 10)
        errors.push('Content must be at least 10 characters');

    if (errors.length > 0) {
        return res.render('errors.njk', {
            rows: errors,
            loggedin: req.session.loggedin
        });
    }
    if (errors.length === 0) {
        // sanitize title och body, tvätta datan
        const sanitize = (str) => {
            let temp = str.trim();
            temp = validator.stripLow(temp);
            temp = validator.escape(temp);
            return temp;
        };
        if (title) sanitizedTitle = filter.clean(sanitize(title));
        if (content) sanitizedContent = filter.clean(sanitize(content));
    }

    // kör frågan för att skapa ett nytt inlägg
    const [rows] = await promisePool.query('INSERT INTO al04forum (authorid, title, content) VALUES (?, ?, ?)', [userId, sanitizedTitle, sanitizedContent]);
    res.redirect('/'); // den här raden kan vara bra att kommentera ut för felsökning, du kan då använda tex. res.json({rows}) för att se vad som skickas tillbaka från databasen
});

router.get('/new', async function (req, res, next) {
    if (req.session.loggedin === undefined) {
        return res.status(401).send('Login to create a post')
    } else {

        const [users] = await promisePool.query("SELECT * FROM al04users WHERE id = ?", [req.session.userid]);
        res.render('new.njk', {
            title: 'Nytt inlägg',
            users,
            loggedin: req.session.loggedin 
        });
    }
});

router.get('/post/:id', async function (req, res) {
    const [rows] = await promisePool.query(
        `SELECT al04forum.*, al04users.name AS username
        FROM al04forum
        JOIN al04users ON al04forum.authorId = al04users.id
        WHERE al04forum.id = ?;`,
        [req.params.id]
    );

    res.render('post.njk', {
        post: rows[0],
        title: 'Post',
        loggedin: req.session.loggedin
    });
});



//--------------------------LOGIN STUFF--------------------------------------


router.get('/login', function (req, res, next) {
    if (req.session.loggedin === true) {
        return res.redirect('/profile');
    }
    res.render('login.njk', {
        title: 'Login',
        loggedin: req.session.loggedin
    });
});

router.get('/delete', async function (req, res, next) {
    if (req.session.loggedin === true) {
        req.session.loggedin = false;
        await promisePool.query('DELETE FROM al04users WHERE id = ?', [req.session.userid],);
        return res.redirect('/login');
    }
});

router.post('/login', async function (req, res, next) {
    if (req.session.loggedin === true) {
        return res.redirect('/profile');
    }
    const { username, password } = req.body;
    const errors = [];

    if (username === '') {
        //console.log('Username is Required');
        errors.push('Username is Required');
    } else {
    }

    if (password === '') {
        //console.log('Password is Required');
        errors.push('Password is Required');
    }
    if (errors.length > 0) {
        return res.render('errors.njk', {
            rows: errors,
            loggedin: req.session.loggedin
        });
    }

    const [users] = await promisePool.query('SELECT * FROM al04users WHERE name = ?', [username],);
    if (users.length > 0) {
        bcrypt.compare(password, users[0].password, function (err, result) {
            if (result === true) {
                req.session.loggedin = true;
                req.session.userid = users[0].id;
                req.session.username = users[0].name;
                return res.redirect('/profile');
            } else {
                return res.json('Invalid username or password');
            }
        });
    } else {
        return res.redirect("/login");
    }
});


router.get('/profile', async function (req, res, next) {

    if (req.session.loggedin === undefined) {

        return res.status(401).send('Access Denied');
    } else {
        const [rows] = await promisePool.query("SELECT * FROM al04forum WHERE authorId = ? ORDER BY createdAt DESC", [req.session.userid]);
        const [username] = await promisePool.query('SELECT * FROM al04users WHERE id = ?', [req.session.userid],);
        res.render('profile.njk', {
            title: 'Profile',
            username: username[0].name,
            rows: rows,
            loggedin: req.session.loggedin
        });
    }
});

router.get('/crypt/:password', function (req, res, next) {
    bcrypt.hash(req.params.password, 10, function (err, hash) {
        // Store hash in your password DB.
        return res.json({ hash });
    });
});

router.post('/register', async function (req, res, next) {
    const { username, password, passwordConfirmation } = req.body;
    const errors = [];

    if (username === '') {
        errors.push('Username is Required');
    }

    if (!validator.isAlphanumeric(username, 'en-US')) {
        errors.push('Username can only contain letters and numbers');
    }

    if (password === '') {
        errors.push('Password is Required');
    }
    if (password.length <= 8) {
        errors.push('Password must minimum be 8 characters');
    }

    if (password !== passwordConfirmation) {
        errors.push('Passwords do not match');
    }
    const [userCheck] = await promisePool.query('SELECT name FROM al04users WHERE name = ?', [username],);
    if (userCheck.length > 0) {
        errors.push('Username is already taken');
    }
    if (errors.length > 0) {
        return res.render('errors.njk', {
            rows: errors,
            loggedin: req.session.loggedin
        });
    } else {
        bcrypt.hash(password, 10, async function (err, hash) {
            const [newUser] = await promisePool.query('INSERT INTO al04users (name, password) VALUES (?, ?)', [username, hash])
            return res.redirect('/login');
        });


    }
});

router.get('/register', async function (req, res, next) {
    if (req.session.loggedin === true) {
        return res.json('Logout to create an account');
    }
    res.render('register.njk', {
        title: 'Register',
        loggedin: req.session.loggedin
    });
});

router.get('/logout', function (req, res, next) {
    req.session.loggedin = undefined;
    return res.redirect('/login')

});

router.post('/logout', async function (req, res, next) {
    if (req.session.loggedin === undefined) {

        return res.status(401).send('Access Denied');
    }
    else {
        req.session.loggedin = undefined;
        return res.redirect('/')
    }
});
router.get('/kaka', function (req, res, next) {
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: NEVER(Probably(maybe))</p>')
        res.end()
    } else {
        req.session.views = 1
        res.end('welcome to the session demo. refresh!')
    }
})



module.exports = router;
