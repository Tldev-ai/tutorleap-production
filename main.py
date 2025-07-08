#!/usr/bin/env python3
"""
AI Content Generator v3.0
Main application file with interactive menu
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
try:
    from src.image_generator import ImageGenerator
    from src.instagram_poster import InstagramPoster
    from src.content_generator import ContentGenerator
    from src.trending_collector import TrendingCollector
    from src.topic_processor import TopicProcessor
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please run 'python test_setup.py' first to check your setup")
    sys.exit(1)

class AIContentGenerator:
    """Main application class"""
    
    def __init__(self):
        """Initialize the AI content generator"""
        self.image_generator = ImageGenerator()
        self.instagram_poster = InstagramPoster()
        self.content_generator = ContentGenerator()
        self.trending_collector = TrendingCollector()
        self.topic_processor = TopicProcessor()
    
    def show_banner(self):
        """Display application banner"""
        print("=" * 60)
        print("🤖 AI CONTENT GENERATOR v3.0")
        print("=" * 60)
        print("🎨 Generate AI images with DALL-E")
        print("📝 Create engaging captions with GPT-4")
        print("📱 Schedule Instagram posts automatically")
        print("🔥 Discover trending topics")
        print("=" * 60)
    
    def show_menu(self):
        """Display main menu"""
        print("\n📋 MAIN MENU")
        print("-" * 30)
        print("1. 🔥 Get Trending Topics")
        print("2. 🎨 Generate AI Image Only")
        print("3. 📝 Generate Complete Post (Image + Caption)")
        print("4. 📱 Schedule Instagram Post")
        print("5. 📊 View Account Stats")
        print("6. 📅 Check Scheduled Posts")
        print("7. ⚙️  Settings & Configuration")
        print("8. 🧪 Run Setup Tests")
        print("0. 🚪 Exit")
        print("-" * 30)
    
    def get_trending_topics(self):
        """Get and display trending topics"""
        print("\n🔥 TRENDING TOPICS")
        print("=" * 40)
        
        # Get niche from user
        niches = ["Technology", "Business", "Health", "Lifestyle"]
        print("Available niches:")
        for i, niche in enumerate(niches, 1):
            print(f"{i}. {niche}")
        
        try:
            choice = input("\nSelect niche (1-4) or enter custom: ").strip()
            
            if choice.isdigit() and 1 <= int(choice) <= 4:
                selected_niche = niches[int(choice) - 1]
            else:
                selected_niche = choice if choice else "Technology"
            
            print(f"\n🔍 Fetching trending topics for {selected_niche}...")
            topics = self.trending_collector.get_trending_topics(selected_niche, 10)
            
            if topics:
                print(f"\n✅ Found {len(topics)} trending topics:")
                for i, topic in enumerate(topics, 1):
                    if isinstance(topic, dict):
                        print(f"\n{i}. {topic.get('title', 'No title')}")
                        if topic.get('source'):
                            print(f"   Source: {topic['source']}")
                        if topic.get('keywords'):
                            print(f"   Keywords: {', '.join(topic['keywords'][:3])}")
                    else:
                        print(f"{i}. {topic}")
                
                # Ask if user wants to use one of these topics
                use_topic = input("\nUse one of these topics? (y/n): ").lower()
                if use_topic == 'y':
                    try:
                        topic_num = int(input("Enter topic number: ")) - 1
                        if 0 <= topic_num < len(topics):
                            selected_topic = topics[topic_num]
                            topic_title = selected_topic.get('title', selected_topic) if isinstance(selected_topic, dict) else selected_topic
                            return self.generate_complete_post(topic_title, selected_niche)
                    except (ValueError, IndexError):
                        print("Invalid topic number")
            else:
                print("❌ No trending topics found")
        
        except Exception as e:
            print(f"❌ Error getting trending topics: {str(e)}")
    
    def generate_ai_image(self, topic=None, niche=None):
        """Generate AI image only"""
        print("\n🎨 AI IMAGE GENERATION")
        print("=" * 40)
        
        if not topic:
            topic = input("Enter topic for image: ").strip()
        if not niche:
            niche = input("Enter niche (default: Technology): ").strip() or "Technology"
        
        style = input("Enter style (professional/artistic/minimalist): ").strip() or "professional"
        
        print(f"\n🎯 Generating image for: {topic}")
        print(f"   Niche: {niche}")
        print(f"   Style: {style}")
        
        result = self.image_generator.generate_image(topic, niche, style)
        
        if result['success']:
            print(f"\n✅ Image generated successfully!")
            print(f"   📁 File: {result['filename']}")
            print(f"   📂 Path: {result['filepath']}")
            print(f"   📏 Size: {result['file_size']} bytes")
            print(f"   📐 Dimensions: {result['dimensions']}")
            return result
        else:
            print(f"\n❌ Image generation failed: {result['error']}")
            return None
    
    def generate_complete_post(self, topic=None, niche=None):
        """Generate complete post with image and caption"""
        print("\n📝 COMPLETE POST GENERATION")
        print("=" * 40)
        
        if not topic:
            topic = input("Enter topic: ").strip()
        if not niche:
            niche = input("Enter niche (default: Technology): ").strip() or "Technology"
        
        style = input("Enter content style (professional/casual/educational): ").strip() or "professional"
        
        print(f"\n🚀 Generating complete post...")
        print(f"   📝 Topic: {topic}")
        print(f"   🎯 Niche: {niche}")
        print(f"   🎨 Style: {style}")
        
        # Step 1: Generate image
        print("\n🎨 Step 1: Generating AI image...")
        image_result = self.image_generator.generate_image(topic, niche, style)
        
        if not image_result['success']:
            print(f"❌ Image generation failed: {image_result['error']}")
            return None
        
        print(f"✅ Image created: {image_result['filename']}")
        
        # Step 2: Generate content
        print("\n📝 Step 2: Generating caption and hashtags...")
        content_result = self.content_generator.generate_post(topic, niche, style)
        
        if not content_result['success']:
            print(f"❌ Content generation failed: {content_result['error']}")
            return None
        
        print(f"✅ Caption generated ({content_result['character_count']} characters)")
        print(f"✅ Generated {len(content_result['hashtags'])} hashtags")
        
        # Step 3: Save complete post
        complete_post = {
            'topic': topic,
            'niche': niche,
            'style': style,
            'image': image_result,
            'content': content_result,
            'created_at': datetime.now().isoformat()
        }
        
        # Save to output directory
        os.makedirs("output/complete_posts", exist_ok=True)
        import json
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        post_file = f"output/complete_posts/post_{timestamp}.json"
        
        with open(post_file, 'w') as f:
            json.dump(complete_post, f, indent=2)
        
        # Display results
        print(f"\n✅ COMPLETE POST GENERATED!")
        print("=" * 40)
        print(f"📁 Saved to: {post_file}")
        print(f"\n📝 CAPTION PREVIEW:")
        print("-" * 30)
        print(content_result['caption'][:200] + "..." if len(content_result['caption']) > 200 else content_result['caption'])
        print(f"\n🏷️  HASHTAGS ({len(content_result['hashtags'])}):")
        print(" ".join([f"#{tag}" for tag in content_result['hashtags'][:10]]))
        print(f"\n📊 ANALYTICS:")
        print(f"   Hook Score: {content_result['hook_score']}/100")
        print(f"   Estimated Reach: {content_result['estimated_reach']['estimated_impressions']}")
        
        # Ask if user wants to schedule it
        schedule = input("\n📅 Schedule this post for Instagram? (y/n): ").lower()
        if schedule == 'y':
            return self.schedule_post(image_result['filepath'], content_result['caption'], content_result['hashtags'])
        
        return complete_post
    
    def schedule_post(self, image_path=None, caption=None, hashtags=None):
        """Schedule a post for Instagram"""
        print("\n📅 SCHEDULE INSTAGRAM POST")
        print("=" * 40)
        
        if not image_path:
            # List available generated images
            images = self.image_generator.get_generated_images()
            if not images:
                print("❌ No generated images found. Generate an image first.")
                return
            
            print("Available images:")
            for i, img in enumerate(images[:10], 1):
                print(f"{i}. {img['filename']} ({img['file_size']} bytes)")
            
            try:
                choice = int(input("\nSelect image (1-10): ")) - 1
                image_path = images[choice]['filepath']
            except (ValueError, IndexError):
                print("Invalid selection")
                return
        
        if not caption:
            caption = input("Enter caption: ").strip()
        
        if not hashtags:
            hashtags_input = input("Enter hashtags (space-separated): ").strip()
            hashtags = hashtags_input.split() if hashtags_input else []
        
        # Schedule the post
        result = self.instagram_poster.schedule_post(image_path, caption, hashtags)
        
        if result['success']:
            print(f"✅ Post scheduled successfully!")
            print(f"   ID: {result['post_id']}")
            print(f"   Scheduled for: {result['scheduled_time']}")
        else:
            print(f"❌ Scheduling failed: {result['error']}")
    
    def view_account_stats(self):
        """View Instagram account statistics"""
        print("\n📊 INSTAGRAM ACCOUNT STATS")
        print("=" * 40)
        
        stats = self.instagram_poster.get_account_stats()
        
        if 'error' in stats:
            print(f"❌ {stats['error']}")
            print("💡 Make sure to add Instagram credentials to .env file")
        else:
            print(f"👤 Username: {stats['username']}")
            print(f"👥 Followers: {stats['followers']:,}")
            print(f"👤 Following: {stats['following']:,}")
            print(f"📸 Posts: {stats['posts']:,}")
            if stats.get('full_name'):
                print(f"📝 Name: {stats['full_name']}")
    
    def check_scheduled_posts(self):
        """Check and display scheduled posts"""
        print("\n📅 SCHEDULED POSTS")
        print("=" * 40)
        
        scheduled = self.instagram_poster.get_scheduled_posts()
        
        if not scheduled:
            print("📭 No scheduled posts found")
            return
        
        pending = [p for p in scheduled if p['status'] == 'scheduled']
        posted = [p for p in scheduled if p['status'] == 'posted']
        failed = [p for p in scheduled if p['status'] == 'failed']
        
        print(f"📊 SUMMARY:")
        print(f"   ⏳ Pending: {len(pending)}")
        print(f"   ✅ Posted: {len(posted)}")
        print(f"   ❌ Failed: {len(failed)}")
        
        if pending:
            print(f"\n⏳ PENDING POSTS:")
            for post in pending[:5]:
                print(f"   • {post['id']} - {post['scheduled_time']}")
        
        # Check if any posts are ready to be posted
        check_result = self.instagram_poster.check_and_post_scheduled()
        if check_result['posted_count'] > 0:
            print(f"\n🎉 Posted {check_result['posted_count']} scheduled posts!")
    
    def show_settings(self):
        """Show current settings and configuration"""
        print("\n⚙️  SETTINGS & CONFIGURATION")
        print("=" * 40)
        
        # Check API keys
        openai_key = os.getenv('OPENAI_API_KEY')
        instagram_user = os.getenv('INSTAGRAM_USERNAME')
        
        print("🔑 API Configuration:")
        print(f"   OpenAI API Key: {'✅ Set' if openai_key else '❌ Missing'}")
        print(f"   Instagram Username: {'✅ Set' if instagram_user else '❌ Missing'}")
        
        print("\n📁 Directory Status:")
        directories = [
            "output/generated_images",
            "output/complete_posts",
            "data/instagram_sessions",
            "data/scheduled_posts"
        ]
        
        for directory in directories:
            exists = os.path.exists(directory)
            file_count = len(os.listdir(directory)) if exists else 0
            print(f"   {directory}: {'✅' if exists else '❌'} ({file_count} files)")
        
        print(f"\n📊 Usage Statistics:")
        try:
            images = self.image_generator.get_generated_images()
            scheduled = self.instagram_poster.get_scheduled_posts()
            print(f"   Generated Images: {len(images)}")
            print(f"   Scheduled Posts: {len(scheduled)}")
        except Exception as e:
            print(f"   Error loading stats: {str(e)}")
    
    def run_setup_tests(self):
        """Run setup tests"""
        print("\n🧪 Running setup tests...")
        import subprocess
        result = subprocess.run([sys.executable, 'test_setup.py'], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
    
    def run(self):
        """Main application loop"""
        self.show_banner()
        
        while True:
            try:
                self.show_menu()
                choice = input("\nEnter your choice (0-8): ").strip()
                
                if choice == '0':
                    print("\n👋 Thank you for using AI Content Generator!")
                    break
                elif choice == '1':
                    self.get_trending_topics()
                elif choice == '2':
                    self.generate_ai_image()
                elif choice == '3':
                    self.generate_complete_post()
                elif choice == '4':
                    self.schedule_post()
                elif choice == '5':
                    self.view_account_stats()
                elif choice == '6':
                    self.check_scheduled_posts()
                elif choice == '7':
                    self.show_settings()
                elif choice == '8':
                    self.run_setup_tests()
                else:
                    print("❌ Invalid choice. Please enter 0-8.")
                
                input("\nPress Enter to continue...")
                
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ An error occurred: {str(e)}")
                input("Press Enter to continue...")

def main():
    """Main entry point"""
    try:
        app = AIContentGenerator()
        app.run()
    except Exception as e:
        print(f"❌ Failed to start application: {str(e)}")
        print("💡 Try running 'python test_setup.py' first")

if __name__ == "__main__":
    main()