# Asterisk

An app to serve IGCSE & A Level MCQ Questions.

## Tech Stack

- MERN with NextJS (TypeScript)
- Formik and Yup for Client Side Validation
- Chakra UI Library for NextJS | For the Minimalistic Flat design desired
- Mongoose + ZOD for extra layer of Server Side Validation
- NextAuthJS, ResendEmail (custom email after domain purchase) for signin authentication (OTP Verification)
- ReactEmail for formatting the email to be sent
- BcryptJS for password encryption and matching
- RazorPay Payment API

## Resources & Planned Features

- Paid Heroku Server + Namecheap domain + Free MongoDB database to store approx 10k AI generated MCQs (with explanations, based on actual papers but not copying them, [CAIE Copyright](https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fwww.cambridgeinternational.org%2FImages%2F114147-application-copyright-guidance.docx&wdOrigin=BROWSELINK) ). Approx storage consumed will be less than 50MB so will easily fit in the 512MB free plan.
- Questions will have default difficultyRatings based on their difficulty, to be adjusted dynamically after sufficient inputs, with intial frequency distribution resembling a normal curve. Users too will have a dynamic performance rating (userRating) per subject and will be served questions with difficultyRatings within range of +-30 of their userRating.
- Small space to keep user accounts as well, estimated 50-100 free signups atleast after some Reddit self-promotion (can pay mods to pin the stuff for a week).
- Will work on AI Grader Access but only after 5-10 paid signups, as it will require paid OpenAI GPT4 integration.
- RazorPay API integration, planning to restrict free users to 2 total subjects, 30 Practice Problems a day, and no AI Grader Access (have to see if this works accurately enough at all to be bothered after). Pricing, 'donation', could be $20 for an all access pass forever, discounted to $5 for the first 10 paid users (in effect most probably forever).

## Development in Progress

- Signup/Signin Authentication Completed
- Most API routes and redirections set
- Database initialized on MongoDB with AS/A Level Economics Question Bank.

![Difficulty Rating](public/Images/normalCurve.png)

## Designing in Progress

### Landing

![Landing](public/Images/info.png)

### Signup

![Signup](public/Images/signup.png)

### Login

![Login](public/Images/login.png)

### Welcome

![Welcome](public/Images/welcome.png)
