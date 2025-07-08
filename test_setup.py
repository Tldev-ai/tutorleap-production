# test_setup.py - Test your new AI content pipeline
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment():
    """Test if environment is properly set up"""
    print("🧪 Testing Environment Setup...")
    print("=" * 50)
    
    # Check OpenAI API Key
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print("✅ OpenAI API Key: Found")
        print(f"   Key starts with: {api_key[:10]}...")
    else:
        print("❌ OpenAI API Key: Missing")
        print("   Please add OPENAI_API_KEY to your .env file")
        return False
    
    # Check required directories
    directories = [
        "output/generated_images",
        "output/complete_posts",
        "data/instagram_sessions",
        "data/scheduled_posts"
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"✅ Directory exists: {directory}")
    
    # Test imports
    print("\n🔍 Testing Imports...")
    try:
        import openai
        print("✅ OpenAI library imported")
        
        import PIL
        print("✅ PIL (Pillow) library imported")
        
        import instagrapi
        print("✅ Instagrapi library imported")
        
        from src.image_generator import ImageGenerator
        print("✅ ImageGenerator module imported")
        
        from src.instagram_poster import InstagramPoster
        print("✅ InstagramPoster module imported")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False
    
    print("\n✅ Environment setup test completed successfully!")
    return True

def test_image_generation():
    """Test image generation functionality"""
    print("\n🎨 Testing Image Generation...")
    print("=" * 50)
    
    try:
        from src.image_generator import ImageGenerator
        
        # Initialize generator
        generator = ImageGenerator()
        print("✅ ImageGenerator initialized")
        
        # Test image generation
        print("🎯 Generating test image...")
        result = generator.generate_image(
            topic="Artificial Intelligence in the future",
            niche="Technology",
            style="professional"
        )
        
        if result['success']:
            print(f"✅ Image generated successfully!")
            print(f"   File: {result['filename']}")
            print(f"   Path: {result['filepath']}")
            print(f"   Size: {result['file_size']} bytes")
            
            # Check if file actually exists
            if os.path.exists(result['filepath']):
                print("✅ Image file verified on disk")
                return True
            else:
                print("❌ Image file not found on disk")
                return False
        else:
            print(f"❌ Image generation failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Image generation test failed: {str(e)}")
        return False

def test_instagram_poster():
    """Test Instagram poster (without actually logging in)"""
    print("\n📱 Testing Instagram Poster...")
    print("=" * 50)
    
    try:
        from src.instagram_poster import InstagramPoster
        
        # Initialize poster
        poster = InstagramPoster()
        print("✅ InstagramPoster initialized")
        
        # Test scheduled posts functionality
        scheduled = poster.get_scheduled_posts()
        print(f"✅ Scheduled posts loaded: {len(scheduled)} posts")
        
        # Test account stats (will fail without login, but that's expected)
        stats = poster.get_account_stats()
        expected_error = 'error' in stats
        if expected_error:
            print("✅ Account stats test passed (expected error when not logged in)")
        
        return True
        
    except Exception as e:
        print(f"❌ Instagram poster test failed: {str(e)}")
        return False

def test_complete_pipeline():
    """Test the complete pipeline (content generation only)"""
    print("\n🚀 Testing Complete Pipeline...")
    print("=" * 50)
    
    try:
        # Import your existing content generator
        from src.content_generator import ContentGenerator
        from src.trending_collector import TrendingCollector
        from src.topic_processor import TopicProcessor
        
        print("✅ Existing modules imported successfully")
        
        # Test trending topic collection
        collector = TrendingCollector()
        topics = collector.get_trending_topics("Technology")
        
        if topics and len(topics) > 0:
            print(f"✅ Trending topics collected: {len(topics)} topics")
            print(f"   Sample topic: {topics[0] if topics else 'None'}")
        else:
            print("⚠️  No trending topics found (this might be normal)")
        
        # Test content generation
        generator = ContentGenerator()
        test_topic = "AI revolutionizing content creation"
        
        content = generator.generate_post(
            topic=test_topic,
            niche="Technology",
            style="professional"
        )
        
        if content and 'caption' in content:
            print("✅ Content generation successful")
            print(f"   Caption length: {len(content['caption'])} characters")
            print(f"   Hashtags: {len(content.get('hashtags', []))} tags")
            return True
        else:
            print("❌ Content generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Complete pipeline test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 AI CONTENT GENERATOR v3.0 - SETUP TESTING")
    print("=" * 60)
    
    tests = [
        ("Environment Setup", test_environment),
        ("Image Generation", test_image_generation),
        ("Instagram Poster", test_instagram_poster),
        ("Complete Pipeline", test_complete_pipeline)
    ]
    
    results = []
    
    for test_name, test_function in tests:
        try:
            result = test_function()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {str(e)}")
            results.append((test_name, False))
        
        print()  # Add spacing between tests
    
    # Summary
    print("=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Your setup is ready to go!")
        print("\nNext steps:")
        print("1. Run: python main.py")
        print("2. Try option 2 (Generate AI Image Only) first")
        print("3. Then try option 3 (Generate Complete Post)")
        print("4. Finally setup Instagram login for full automation")
    else:
        print(f"\n⚠️  {len(results) - passed} tests failed. Please fix the issues above.")
        print("\nCommon issues:")
        print("• Missing OpenAI API key in .env file")
        print("• Missing dependencies (run: pip install -r requirements.txt)")
        print("• File permission issues")

if __name__ == "__main__":
    main()