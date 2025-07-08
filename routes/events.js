const express = require("express");
const router = express.Router();
const db = require("../firebaseAdmin");

// ✅ GET all events
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ POST new event
router.post("/", async (req, res) => {
  try {
    const { title, description, dateTime, email } = req.body;

    if (!title || !dateTime || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doc = await db.collection("events").add({
      title,
      description,
      dateTime,
      email,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ message: "Event saved", id: doc.id });
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ DELETE event
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("events").doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
