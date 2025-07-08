import os
import requests
from datetime import datetime
from openai import OpenAI
from PIL import Image
import io

class ImageGenerator:
    """Generate AI images using OpenAI DALL-E"""
    
    def __init__(self):
        """Initialize the image generator"""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.output_dir = "output/generated_images"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_image(self, topic, niche="Technology", style="professional", size="1024x1024"):
        """
        Generate an AI image based on topic and parameters
        
        Args:
            topic (str): The main topic/subject for the image
            niche (str): The niche/category (e.g., Technology, Health, etc.)
            style (str): Style of the image (professional, artistic, etc.)
            size (str): Image size (1024x1024, 512x512, etc.)
        
        Returns:
            dict: Result with success status, filename, filepath, and metadata
        """
        try:
            # Create a detailed prompt
            prompt = self._create_image_prompt(topic, niche, style)
            
            print(f"🎨 Generating image with prompt: {prompt[:100]}...")
            
            # Generate image using DALL-E
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=size,
                quality="standard",
                n=1,
            )
            
            # Get the image URL
            image_url = response.data[0].url
            
            # Download and save the image
            image_response = requests.get(image_url)
            image_response.raise_for_status()
            
            # Create filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ai_image_{niche.lower()}_{timestamp}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            # Save the image
            with open(filepath, 'wb') as f:
                f.write(image_response.content)
            
            # Get file size
            file_size = os.path.getsize(filepath)
            
            # Verify image can be opened
            with Image.open(filepath) as img:
                width, height = img.size
            
            return {
                'success': True,
                'filename': filename,
                'filepath': filepath,
                'file_size': file_size,
                'dimensions': f"{width}x{height}",
                'prompt': prompt,
                'topic': topic,
                'niche': niche,
                'style': style
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'topic': topic,
                'niche': niche,
                'style': style
            }
    
    def _create_image_prompt(self, topic, niche, style):
        """Create a detailed prompt for image generation"""
        
        style_descriptions = {
            "professional": "clean, modern, professional design with high quality",
            "artistic": "creative, artistic, visually striking with artistic flair",
            "minimalist": "clean, simple, minimalist design with elegant composition",
            "futuristic": "futuristic, high-tech, innovative design elements",
            "vibrant": "colorful, vibrant, energetic design with bold colors"
        }
        
        style_desc = style_descriptions.get(style.lower(), "professional and high quality")
        
        prompt = f"""
        Create a {style_desc} image about {topic} in the {niche} niche. 
        The image should be suitable for social media posting, visually appealing, 
        and clearly related to the topic. Make it engaging and professional.
        """.strip()
        
        return prompt
    
    def get_generated_images(self):
        """Get list of all generated images"""
        images = []
        if os.path.exists(self.output_dir):
            for filename in os.listdir(self.output_dir):
                if filename.endswith(('.png', '.jpg', '.jpeg')):
                    filepath = os.path.join(self.output_dir, filename)
                    file_size = os.path.getsize(filepath)
                    images.append({
                        'filename': filename,
                        'filepath': filepath,
                        'file_size': file_size,
                        'created': datetime.fromtimestamp(os.path.getctime(filepath))
                    })
        return sorted(images, key=lambda x: x['created'], reverse=True)