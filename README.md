## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed on your system:

- React.js
- node.js
- express

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repository
   ```
2. Install the dependencies for the fronted:
   `npm install`
   `npm install react-spinners --save`
   `npm install @mui/material @emotion/react @emotion/styled`
   `npm install react-swipeable`
   `npm install xlsx`
   `npm install @mui/x-date-pickers @mui/material @emotion/react @emotion/styled @mui/icons-material dayjs`
   `npm install axios`
   `npm install chart.js react-chartjs-2`

3. move to the backend folder
   `cd ./backend`

   Install the dependencies for the fronted:
   `npm install express`
   `npm install body-parser`
   `npm install cors`
   `npm install axios`

### Configuration

Before running the backend, you need to create two files in the `backend` folder:

1. **users.json**  
   Copy the structure from `users.json` and add your own user data. Example:
   ```json
   [
     {
       "username": "admin",
       "password": "admin123",
       "role": "admin"
     }
     {
       "username": "user",
       "password": "user123",
       "role": "user"
     }
   ]
   ```
2. **logs.json**  
   Copy the structure from `logs.json` and add your own log data. Example:
   ```json
   [
     {
       "id": 0,
       "username": "user",
       "type": "check-in OR check-out",
       "timestamp": "00:00:00",
       "date": "01-01-2000"
     }
   ]
   ```
