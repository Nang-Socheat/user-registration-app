const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const helmet = require('helmet');

const app = express();
const PORT = 3000;

// Use Helmet to set secure HTTP headers
// Disable contentSecurityPolicy to allow inline styles and scripts
app.use(helmet({
	contentSecurityPolicy: false
}));

// Set Handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// GET /register - Show the registration form
app.get('/register', (req, res) => {
	res.render('register');
});

// POST /register - Handle form submission
app.post('/register', (req, res) => {
	const form = new multiparty.Form();

	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(500).send('Error parsing form data.');
		}
		// Extract field values (multiparty returns arrays, so we take [0])
		const fullName = fields.fullName[0];
		const email = fields.email[0];
		const course = fields.course[0];

		// Check if a file was uploaded
		const file = files.profilePic ? files.profilePic[0] : null;

		if (!file || file.size === 0) {
			return res.status(400).send('Please upload a profile picture.');
		}
		// Build the new file path in public/uploads
		const oldPath = file.path;
		const fileName = Date.now() + '-' + file.originalFilename;
		const newPath = path.join(__dirname, 'public', 'uploads', fileName);

		// Move the file from temp location to public/uploads
		// fs.rename(oldPath, newPath, (err) => {
		// 	if (err) {
		// 		return res.status(500).send('Error saving uploaded file.');
		// 	}

		fs.copyFile(oldPath, newPath, (err) => {
            if (err) {
                return res.status(500).send('Error saving uploaded file.');
            }
            // Delete the temp file after copying
            fs.unlink(oldPath, () => {});

			// Render profile page with the user's data
			res.render('profile', {
				fullName,
				email,
				course,
				profilePic: '/uploads/' + fileName
			});
		});
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
