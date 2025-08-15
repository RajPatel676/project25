async function query(data) {
  const response = await fetch("https://router.huggingface.co/replicate/v1/models/qwen/qwen-image/predictions", {
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`, // Fixed: Added backticks for template literal
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });
  
  // Check if response is ok
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.blob();
  return result;
}

query({
  input: {
    prompt: "Astronaut riding a horse", // Fixed: Removed extra quotes
  },
}).then((response) => {
  // Create object URL for the blob to display the image
  const imageUrl = URL.createObjectURL(response);
  console.log('Image generated:', imageUrl);
  
  // Example: Display in an img element
  // const img = document.createElement('img');
  // img.src = imageUrl;
  // document.body.appendChild(img);
}).catch((error) => {
  console.error('Error generating image:', error);
});