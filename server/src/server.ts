import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

const PORT = 5000;
const FASTAPI_URL = "http://127.0.0.1:8000";

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`);

    res.json({
      status: "Node/Express is running",
      fastapi: response.data,
    });
  } catch (error) {
    res.status(500).json({
      status: "Node/Express is running",
      fastapi: "Unavailable",
    });
  }
});

// HSE priorities
app.get("/api/interventions/priorities", async (req, res) => {
  try {
    const response = await axios.get(
      `${FASTAPI_URL}/interventions/priorities`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to connect to FastAPI",
    });
  }
});

// Specific intervention
app.get("/api/interventions/:patternId", async (req, res) => {
  try {
    const { patternId } = req.params;

    const response = await axios.get(
      `${FASTAPI_URL}/interventions/${patternId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch intervention",
    });
  }
});

// Supporting reports
app.get("/api/interventions/:patternId/reports", async (req, res) => {
  try {
    const { patternId } = req.params;

    const response = await axios.get(
      `${FASTAPI_URL}/interventions/${patternId}/reports`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch supporting reports",
    });
  }
});

// Precursor patterns
app.get("/api/precursors", async (req, res) => {
  try {
    const response = await axios.get(
      `${FASTAPI_URL}/precursors`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch precursor patterns",
    });
  }
});

// Reports
app.get("/api/reports", async (req, res) => {
  try {
    const response = await axios.get(
      `${FASTAPI_URL}/reports`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch reports",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Node/Express server running on http://localhost:${PORT}`);
});