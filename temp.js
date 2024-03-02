import axios from 'axios';

            const fetchData = async () => {
              const url = 'https://soliton.net.ua/water/api/water/index.php'; // Replace with the actual URL
              const requestData = {
                device_id: 153,
                ds: '2024-03-02 15:00:00',
                de: '2024-03-02 18:00:00'
              };
            
              try {
                const response = await axios.post(url, requestData);
                console.log(response.data); // This will log the response JSON data
              } catch (error) {
                console.error('Error fetching data:', error.message);
              }
            };
            
            fetchData();
            