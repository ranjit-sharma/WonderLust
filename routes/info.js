const express = require("express");
const SupportSubmission = require("../models/supportSubmission.js");

const router = express.Router();

router.get("/privacy", (req, res) => {
    res.render("info/privacy.ejs");
});

router.get("/terms", (req, res) => {
    res.render("info/terms.ejs");
});

const renderHelp = (req, res) => {
    res.render("info/help.ejs");
};

const renderQuestions = (req, res) => {
    res.render("info/questions.ejs");
};

router.get("/help", renderHelp);
router.get("/help-center", renderHelp);
router.get("/questions", renderQuestions);
router.get("/q-and-a", renderQuestions);

router.get("/about", (req, res) => {
    res.render("info/about.ejs");
});

router.get("/co-hosts", (req, res) => {
    res.render("info/co-hosts.ejs");
});

router.get("/refer-host", (req, res) => {
    res.render("info/refer-host.ejs");
});

const supportPages = {
    safety: {
        title: "Safety support",
        eyebrow: "Your safety matters",
        icon: "fa-shield-halved",
        summary: "If something feels unsafe during a stay or while using WonderLust, move to a safe place first and contact the appropriate local emergency service.",
        sections: [
            ["During an emergency", "Call your local emergency service immediately. WonderLust cannot replace local emergency responders."],
            ["After the immediate danger", "Keep relevant booking details, messages, and evidence. Contact the host or guest only when it is safe to do so."],
            ["Tell us what happened", "Use our neighbourhood concern form for a detailed report, or contact the WonderLust team through the Help Center."]
        ]
    },
    aircover: {
        title: "AirCover information",
        eyebrow: "Help for your stay",
        icon: "fa-umbrella",
        summary: "WonderLust helps you understand your reservation details and connect with the right support when a stay does not go as expected.",
        sections: [
            ["Before you book", "Review the listing description, photos, amenities, location, reviews, and cancellation details carefully."],
            ["A problem during your stay", "Document the issue, contact the host through the available booking information, and keep communication clear."],
            ["Need help?", "Visit the Help Center and include your booking details when explaining the issue so it can be reviewed efficiently."]
        ]
    },
    discrimination: {
        title: "Anti-discrimination",
        eyebrow: "Everyone belongs here",
        icon: "fa-people-group",
        summary: "WonderLust is committed to a respectful community where guests and hosts are treated fairly and with dignity.",
        sections: [
            ["Our expectation", "Users must not discriminate against another person based on protected characteristics or use hateful, threatening, or degrading language."],
            ["If you experience discrimination", "Write down what happened, save relevant messages, and report the concern so it can be reviewed."],
            ["Building a welcoming community", "Use accurate listing information, communicate respectfully, and make decisions based on the stay and the person’s conduct."]
        ]
    },
    accessibility: {
        title: "Disability support",
        eyebrow: "Designed for more people",
        icon: "fa-universal-access",
        summary: "We want WonderLust to be easier to use for people with different access needs and welcome feedback that helps us improve.",
        sections: [
            ["Finding useful details", "Hosts should describe important access information accurately, including entrances, stairs, bathrooms, and other relevant features."],
            ["Ask before booking", "If you need a specific accommodation, contact the host before confirming so expectations are clear."],
            ["Share feedback", "Contact the WonderLust team through the Help Center if a page or listing creates an accessibility barrier."]
        ]
    },
    cancellation: {
        title: "Cancellation options",
        eyebrow: "Plans can change",
        icon: "fa-calendar-xmark",
        summary: "Cancellation availability depends on the reservation and the applicable booking terms.",
        sections: [
            ["Check your reservation", "Open your booking confirmation or Profile to review the reservation status and available cancellation action."],
            ["Before cancelling", "Review the dates, price details, and any applicable terms. Cancelled bookings no longer block those dates for future reservations."],
            ["Need help with a cancellation?", "Contact the host where appropriate and use the Help Center if you cannot resolve the issue."]
        ]
    }
};

Object.entries(supportPages).forEach(([slug, page]) => {
    router.get(`/support/${slug}`, (req, res) => {
        res.render("info/support-detail.ejs", { page });
    });
});

router.get("/support/neighbourhood-concern", (req, res) => {
    res.render("info/neighbourhood-concern.ejs");
});

router.post("/support/neighbourhood-concern", async (req, res, next) => {
    const { name, email, reference, concern } = req.body;
    if (!name?.trim() || !email?.trim() || !concern?.trim()) {
        req.flash("error", "Please complete all complaint form fields.");
        return res.redirect("/support/neighbourhood-concern");
    }

    try {
        await SupportSubmission.create({
            type: "neighbourhood-concern",
            name,
            email,
            reference,
            message: concern,
        });
        req.flash("success", "Your neighbourhood concern has been submitted.");
        res.redirect("/support/neighbourhood-concern");
    } catch (error) {
        next(error);
    }
});

router.get("/feedback", (req, res) => {
    res.render("info/feedback.ejs");
});

router.post("/feedback", async (req, res, next) => {
    const { name, email, rating, message } = req.body;
    if (!name?.trim() || !email?.trim() || !rating || !message?.trim()) {
        req.flash("error", "Please complete all feedback fields.");
        return res.redirect("/feedback");
    }

    try {
        await SupportSubmission.create({
            type: "feedback",
            name,
            email,
            rating: Number(rating),
            message,
        });
        req.flash("success", "Thank you for sharing your feedback with WonderLust.");
        res.redirect("/feedback");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
