 Create Python Virtual Environment

## Windows

    python -m venv venv

Activate:

    venv\Scripts\activate

## Linux / macOS

    python3 -m venv venv

Activate:

    source venv/bin/activate

After activation, the terminal should show something similar to:

    (venv)

---

# 6. Install Dependencies

Install the currently required packages:

    pip install pandas pdfplumber

If a requirements.txt file is available:

    pip install -r requirements.txt

---

# 7. Install Ollama

The project uses Ollama to run a local LLM.

Install Ollama from:

https://ollama.com/

After installation, verify:

    ollama --version

---

# 8. Download the Required Model

Pull the model configured in `extractor.py`.

Example:

    ollama pull llama3.2

Check installed models:

    ollama list

Make sure the model name in `extractor.py` matches the installed model.

---

# 9. Start Ollama

Make sure Ollama is running before starting the Python AI service.

Depending on the installation, Ollama may already be running in the background.

You can verify that Ollama is available by checking:

    ollama list

---

# 10. Prepare Input Data

Place safety datasets inside:

    ai-service/input-data/

Example:

    input-data/
    |
    +-- 2025sh.pdf
    +-- cy-2024-excel-spreadsheet.xlsx
    +-- iogp_2025_hpe_training_dataset.csv
    +-- January2015toNovember2025.csv
    +-- synthetic_oil_safety_reports_100.csv

The ingestion script automatically scans the `input-data` directory.

---

# 11. Ingest Safety Data

Run:

    python ingest_data.py

for making of the work of the fast api 

pip install fastapi uvicorn

and then 

uvicorn main:app --reload --port 8000

not only this then 

on the the cd backend

npm install

npm run dev