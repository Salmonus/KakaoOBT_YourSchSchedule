# Required libraries
import requests
import re
import json
import os
from datetime import datetime
from flask import Flask, request
from nltk.tokenize import sent_tokenize

app = Flask(__name__)

# Define the URL for KoboldAI endpoint
endpoint = ""

# Characters folder name
characters_folder = 'Characters'
characters = []

# Read the character data from JSON files in the folder
for filename in os.listdir(characters_folder):
    if filename.endswith('.json'):
        with open(os.path.join(characters_folder, filename)) as read_file:
            character_data = json.load(read_file)
            characters.append(character_data)

# Get data of the first character
data = characters[0]

# Extract required character details
char_name = data["char_name"]
char_greeting = data["char_greeting"]
dialogue = data["example_dialogue"]

# Number of lines to keep in the conversation history
num_lines_to_keep = 20

# URL for school API
your_sch_code = ""
url = f'https://school-api.xyz/api/high/{your_sch_code}?year=2023&month=' + str(datetime.now().date().month)


# API endpoint to interact with chatbot
@app.route('/chatbot', methods=['POST'])
def chat():
    temp_chat = ''
    body = request.get_json()
    utterance = body['userRequest']['utterance']
    user_id = body['userRequest']['user']['id']
    user_input = utterance

    # Check if the user input is in Korean
    if check_hangul(user_input) == True:
        user_input = "(You can only speak in English)"
    
    # Check and create user's directory
    chatlogs_dir = os.path.join('chatlogs', user_id)
    if not os.path.exists(chatlogs_dir):
        os.makedirs(chatlogs_dir)

    # Check and create user's chatlog file
    chatlog_file = os.path.join(chatlogs_dir, 'chatlog.txt')
    if not os.path.isfile(chatlog_file):
        with open(chatlog_file, 'w') as f:
            f.write(f"{char_name}'s Persona: {data['char_persona']}\n{dialogue}\n")

    # Load the conversation history
    with open(chatlog_file, 'r') as f:
        conversation_history = f.read()

    # Add the user input to the conversation history
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conversation_history += f'You: {user_input}\n'
    temp_chat += f'You: {user_input}\n'

    # Define the prompt for API
    prompt = {
        "prompt": '\n'.join(conversation_history.split('\n')[-num_lines_to_keep:]) + f'{char_name}:',
        "use_story": False,
        "use_memory": False,
        "use_authors_note": False,
        "use_world_info": False,
        "max_context_length": 1000,
        "max_length": 50, #recommend 40~50(for response speed)
        "rep_pen": 1.03,
        "rep_pen_range": 1024,
        "rep_pen_slope": 0.9,
        "temperature": 1,
        "tfs": 0.9,
        "top_a": 0,
        "top_k": 0,
        "top_p": 1,
        "typical": 1,
        "sampler_order": [
            6, 0, 1, 2,
            3, 4, 5
        ]
    }

    # Send a post request to the API endpoint
    response = requests.post(f"{endpoint}/api/v1/generate", json=prompt)

    # Check if the status of the response is successful (200)
    if response.status_code == 200:
        # Extract 'results' from the JSON response
        results = response.json()['results']

        # Take the 'text' field from the first result
        text = results[0]['text']

        # Split the text by "You:"
        split_text = text.split("You:")

        # Remove unnecessary leading/trailing spaces and replace character's name with nothing
        response_text = split_text[0].strip().replace(f"{char_name}:", "").strip()

        # Split the response into sentences
        sentences = sent_tokenize(response_text)

        # Filter out incomplete sentences that don't end with proper punctuation
        sentences = [s for s in sentences if s.endswith(('.', '!', '?'))]

        # Join the sentences back into a single string
        response_text = ' '.join(sentences)

        # Add the character's response to the conversation history
        conversation_history = conversation_history + f'{char_name}: {response_text}\n'
        temp_chat += f'{char_name}: {response_text}\n'

        # Save the updated conversation history, including the bot's response, to a text file
        with open(chatlog_file, 'a') as f:
            f.write(temp_chat)


    else:
        response_text = ""

    # Define the response body
    responseBody = {
        responseBody = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": response_text
                    }
                }
            ],
            "quickReplies": [{
        "messageText": utterance,
        "action": "message",
        "label": "Reload",
        }]
        }
    }

    return responseBody

@app.route('/food', methods=['POST'])
def fetch_school_menu():
    # Retrieve the current date
    current_date = datetime.now().day

    # Extract the request body as a JSON object
    body = request.get_json()

    # Fetch user request utterance
    utterance = body['userRequest']['utterance']

    # Perform an HTTP request to fetch the current school menu
    response = requests.get(url)
    # Convert the response into JSON and extract the 'menu' field
    school_menu = json.loads(response.text)['menu'][current_date - 1]

    # Construct the response body
    responseBody = {
      "version": "2.0",
      "template": {
        "outputs": [
          {
            # Define a carousel for breakfast, lunch, and dinner
            "carousel": {
              "type": "listCard",
              "items": [
                # Construct breakfast items
                create_meal_card(school_menu['breakfast'], "Breakfast"),
                # Construct lunch items
                create_meal_card(school_menu['lunch'], "Lunch"),
                # Construct dinner items
                create_meal_card(school_menu['dinner'], "Dinner")
              ]
            }
          }
        ]
      }
    }

    # Return the constructed response body
    return responseBody


def create_meal_card(meal_menu, meal_name):
    """
    Helper function to create a meal card with the provided menu and meal name.

    :param meal_menu: List of meal items
    :param meal_name: Name of the meal (e.g., "Breakfast", "Lunch", "Dinner")
    :return: A dictionary representing the meal card
    """
    items = []
    for i in range(5):
        items.append({
            "title": meal_menu[i].split("(용인)")[0],
            "description": meal_menu[i].split("(용인)")[1]
        })
    items.append({
        "label": meal_menu[-1].split("(용인)")[0],
        "action": "message",
        "messageText": ""
    })

    return {
        "header": {
            "title": meal_name
        },
        "items": items
    }

# Function to check if a string contains Korean characters
def check_hangul(text):
    if re.search('[가-힣]', text):
        return True
    else:
        return False

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, threaded=True, debug=True)