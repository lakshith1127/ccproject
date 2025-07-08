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
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ POST new event
router.post("/", async (req, res) => {
  try {
    const { title, description, dateTime, email } = req.body;

    // Basic validation
    if (!title?.trim() || !dateTime || !email?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Save to Firestore
    const doc = await db.collection("events").add({
      title: title.trim(),
      description: description?.trim() || "",
      dateTime,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Event saved", id: doc.id });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: check if event exists first
    const docRef = db.collection("events").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Event not found" });
    }

    await docRef.delete();
    res.status(204).send(); // No content
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
