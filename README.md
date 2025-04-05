# Wikipedia Chatbot

*A chatbot for talking about Wikipedia articles.*

## How to use it

To run the project, you'll be required to run some commands in your terminal:

1. **Clone the repo**
```bash
git clone https://github.com/nating/wikipedia-chatbot.git
```
2. **Install dependencies**:
```bash
cd wikipedia-chatbot
npm install
```
3. **Copy the example environment file**:
```bash
cp .env.example .env.local
```
4. **Add your OpenAI APK key to .env.local in the project root (or ask me for one to use!)**:
```bash
OPENAI_API_KEY=<your OpenAI API key>
CHUNK_SIZE=4000
EMBEDDING_MODEL=text-embedding-3-small
MODEL=gpt-4o-mini
```
5. **Run the app locally**:
```bash
npm run dev
```
6. **Open your browser at http://localhost:3000 to use the chatbot.**
7. **Paste in a Wikipedia URL, press `Scrape`, and wait for the scraping/embedding to complete.**
8. **Ask any questions you want about your Wikipedia page!**

Feel free to modify .env.local to mess around with the chunking / models!
