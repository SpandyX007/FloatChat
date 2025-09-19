import dash
from dash import dcc, html
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import requests
import json

# Initialize the Dash app
# We include Font Awesome to get access to the icons used in the layout
app = dash.Dash(__name__, external_stylesheets=['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'])
server = app.server

# --- API Call Function ---
def fetch_api_data(query: str):
    """
    Fetches data from the chat response API using a POST request.
    Sends the user's query in the request body.
    Includes error handling for network issues or bad responses.
    """
    try:
        # --- THE FIX: Changed the URL endpoint from /chat_response to /chat-response ---
        # This now matches the endpoint defined in your FastAPI code (@chat_router.post("/chat-response")).
        url = 'https://lllgw5r0-8000.inc1.devtunnels.ms/chat-response'
        
        # The payload to send, which matches your Pydantic model `ChatRequest`.
        payload = {'query': query}
        
        # Explicit headers to ensure the Content-Type is correct for a FastAPI Pydantic model.
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Sending the payload as JSON.
        response = requests.post(url, json=payload, headers=headers)
        
        # Check for a successful response (HTTP 200)
        if response.status_code == 200:
            data = response.json()
            # Corrected the key to 'reponse' based on your Swagger output.
            # It will also check for 'response' as a fallback.
            return data.get('reponse', data.get('response', json.dumps(data)))
        else:
            # Print the full error details to your terminal for better debugging.
            print(f"API Error: Status Code {response.status_code}")
            print(f"Response Body: {response.text}")
            return f"Error: Failed to fetch data. Status code: {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        # Handle network-related errors (e.g., connection refused)
        print(f"Network Error: {e}")
        return f"Error: Could not connect to the API. Please check the connection. Details: {e}"


# --- App Layout ---
app.layout = html.Div(id='app-container', children=[
    # Store for holding the conversation history
    dcc.Store(id='chat-store', data=[]),

    # --- Sidebar ---
    html.Div(id='sidebar', children=[
        html.Div(id='sidebar-header', children=[
            html.I(className="fas fa-bars"),
            html.H1("Argo AI")
        ]),
        html.Button([
            html.Span("Latest Model"),
            html.I(className="fas fa-chevron-down")
        ], id='model-selector'),
        html.Nav(id='sidebar-nav', children=[
            html.A(html.I(className="far fa-comment-dots"), href="#"),
        ]),
        html.Div(id='sidebar-footer', children=[
            html.A(html.I(className="fas fa-cog"), href="#")
        ])
    ]),

    # --- Main Content ---
    html.Div(id='main-content', children=[
        html.Div(id='main-content-centered', children=[
            # This initial view will be replaced by the chat history after the first message.
            # Greeting
            html.H2(className="greeting", children=[
                "Hello, ", html.Span("User")
            ]),

            # Main input bar - now with a submit button
            html.Div(id='main-input-container', children=[
                dcc.Input(
                    id='user-input',
                    type='text',
                    placeholder='Ask Argo AI...',
                    n_submit=0 # Allows triggering callback on Enter key
                ),
                html.Div(className='input-icons', children=[
                    html.Button(html.I(className="fas fa-plus")),
                    html.Button(html.I(className="fas fa-microphone")),
                    # The new submit button
                    html.Button(html.I(className="fas fa-paper-plane"), id='submit-button', n_clicks=0)
                ])
            ]),

            # Suggestion cards
            html.Div(id='suggestion-cards', children=[
                html.Div(className='card', children=[
                    html.P("Plot salinity profile"),
                    html.Span("for a specific WMO float")
                ]),
                html.Div(className='card', children=[
                    html.P("Find floats"),
                    html.Span("in the Arabian Sea")
                ]),
                html.Div(className='card', children=[
                    html.P("Compare temperature"),
                    html.Span("between two regions")
                ]),
            ])
        ])
    ])
])


# --- Callbacks ---

# Callback 1: Handles new messages, calls the API, and updates the chat history store.
@app.callback(
    Output('chat-store', 'data'),
    Input('submit-button', 'n_clicks'),
    Input('user-input', 'n_submit'),
    State('user-input', 'value'),
    State('chat-store', 'data')
)
def update_chat_history(n_clicks, n_submit, user_input, chat_history):
    # Prevent callback from firing on initial load or if input is empty
    if (n_clicks == 0 and n_submit == 0) or not user_input:
        raise PreventUpdate

    # Add the user's message to the history
    chat_history.append({'sender': 'user', 'content': user_input})

    # Fetch the response from the API, passing the user's input, and add it to the history
    bot_response = fetch_api_data(user_input)
    chat_history.append({'sender': 'bot', 'content': bot_response})

    return chat_history

# Callback 2: Updates the main content area to display the chat history instead of the initial view.
@app.callback(
    Output('main-content-centered', 'children'),
    Input('chat-store', 'data'),
    State('main-content-centered', 'children')
)
def display_chat(chat_history, original_children):
    # If there's no chat history, don't update the view (it stays on the initial screen)
    if not chat_history:
        raise PreventUpdate

    # The input bar is the second element in the original layout, we want to preserve it.
    input_bar = original_children[1]

    # Build the chat display from the history stored in dcc.Store
    chat_messages = []
    for message in chat_history:
        sender = message['sender']
        content = message['content']
        icon_class = "fas fa-user" if sender == 'user' else "fas fa-robot"
        
        message_div = html.Div(className=f'{sender}-message', children=[
            html.I(className=icon_class),
            # Using dcc.Markdown allows for formatted text like bold, italics, lists, etc.
            dcc.Markdown(content, className=f'{sender}-text')
        ])
        chat_messages.append(message_div)
    
    chat_display_container = html.Div(id='chat-display', children=chat_messages)

    # Return the new layout: the chat display and the input bar
    return [chat_display_container, input_bar]


# Callback 3: Clears the input field after a message is sent.
@app.callback(
    Output('user-input', 'value'),
    Input('chat-store', 'data')
)
def clear_input_field(chat_history):
    # This callback is triggered whenever the chat history updates, effectively clearing the input
    # after a new message is added.
    return ''


if __name__ == '__main__':
    app.run(debug=True, port=8051)

