FROM python:3.10-slim

ENV PYTHONUNBUFFERED True

COPY . ./

RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["uvicorn", "main:collabify", "--host", "0.0.0.0"]
