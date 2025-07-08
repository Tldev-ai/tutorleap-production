import os
import json
from datetime import datetime, timedelta
from instagrapi import Client

class InstagramPoster:
    """Handle Instagram posting and account management"""
    
    def __init__(self):
        """Initialize Instagram poster"""
        self.username = os.getenv('INSTAGRAM_USERNAME')
        self.password = os.getenv('INSTAGRAM_PASSWORD')
        self.session_file = "data/instagram_sessions/session.json"
        self.scheduled_posts_file = "data/scheduled_posts/scheduled.json"
        self.client = None
        
        # Create directories
        os.makedirs("data/instagram_sessions", exist_ok=True)
        os.makedirs("data/scheduled_posts", exist_ok=True)
    
    def login(self):
        """Login to Instagram account"""
        try:
            if not self.username or not self.password:
                return {
                    'success': False,
                    'error': 'Instagram credentials not provided in .env file'
                }
            
            self.client = Client()
            
            # Try to load existing session
            if os.path.exists(self.session_file):
                try:
                    self.client.load_settings(self.session_file)
                    self.client.login(self.username, self.password)
                    print("✅ Logged in using saved session")
                except:
                    # Session invalid, create new one
                    self.client.login(self.username, self.password)
                    self.client.dump_settings(self.session_file)
                    print("✅ Logged in with new session")
            else:
                # Fresh login
                self.client.login(self.username, self.password)
                self.client.dump_settings(self.session_file)
                print("✅ Fresh login successful")
            
            return {'success': True, 'message': 'Instagram login successful'}
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Instagram login failed: {str(e)}'
            }
    
    def post_image(self, image_path, caption, hashtags=None):
        """Post an image to Instagram"""
        try:
            if not self.client:
                login_result = self.login()
                if not login_result['success']:
                    return login_result
            
            # Prepare caption with hashtags
            full_caption = caption
            if hashtags:
                hashtag_text = ' '.join([f'#{tag.strip("#")}' for tag in hashtags])
                full_caption = f"{caption}\n\n{hashtag_text}"
            
            # Upload photo
            media = self.client.photo_upload(image_path, full_caption)
            
            return {
                'success': True,
                'media_id': media.id,
                'permalink': f"https://www.instagram.com/p/{media.code}/",
                'message': 'Post uploaded successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to post image: {str(e)}'
            }
    
    def schedule_post(self, image_path, caption, hashtags=None, post_time=None):
        """Schedule a post for later"""
        try:
            # Default to 1 hour from now if no time specified
            if not post_time:
                post_time = datetime.now() + timedelta(hours=1)
            
            scheduled_post = {
                'id': f"scheduled_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'image_path': image_path,
                'caption': caption,
                'hashtags': hashtags or [],
                'scheduled_time': post_time.isoformat(),
                'status': 'scheduled',
                'created_at': datetime.now().isoformat()
            }
            
            # Load existing scheduled posts
            scheduled_posts = self.get_scheduled_posts()
            scheduled_posts.append(scheduled_post)
            
            # Save updated schedule
            with open(self.scheduled_posts_file, 'w') as f:
                json.dump(scheduled_posts, f, indent=2)
            
            return {
                'success': True,
                'post_id': scheduled_post['id'],
                'scheduled_time': post_time.isoformat(),
                'message': 'Post scheduled successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to schedule post: {str(e)}'
            }
    
    def get_scheduled_posts(self):
        """Get all scheduled posts"""
        try:
            if os.path.exists(self.scheduled_posts_file):
                with open(self.scheduled_posts_file, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error loading scheduled posts: {str(e)}")
            return []
    
    def get_account_stats(self):
        """Get account statistics"""
        try:
            if not self.client:
                login_result = self.login()
                if not login_result['success']:
                    return {'error': 'Not logged in to Instagram'}
            
            user_info = self.client.user_info_by_username(self.username)
            
            return {
                'success': True,
                'followers': user_info.follower_count,
                'following': user_info.following_count,
                'posts': user_info.media_count,
                'username': self.username,
                'full_name': user_info.full_name,
                'biography': user_info.biography
            }
            
        except Exception as e:
            return {
                'error': f'Failed to get account stats: {str(e)}'
            }
    
    def check_and_post_scheduled(self):
        """Check for scheduled posts that are ready to be posted"""
        scheduled_posts = self.get_scheduled_posts()
        current_time = datetime.now()
        posted_count = 0
        
        for post in scheduled_posts:
            if post['status'] == 'scheduled':
                scheduled_time = datetime.fromisoformat(post['scheduled_time'])
                
                if current_time >= scheduled_time:
                    # Time to post!
                    result = self.post_image(
                        post['image_path'],
                        post['caption'],
                        post['hashtags']
                    )
                    
                    if result['success']:
                        post['status'] = 'posted'
                        post['posted_at'] = current_time.isoformat()
                        post['media_id'] = result.get('media_id')
                        post['permalink'] = result.get('permalink')
                        posted_count += 1
                        print(f"✅ Posted scheduled content: {post['id']}")
                    else:
                        post['status'] = 'failed'
                        post['error'] = result['error']
                        print(f"❌ Failed to post scheduled content: {post['id']}")
        
        # Save updated scheduled posts
        if posted_count > 0:
            with open(self.scheduled_posts_file, 'w') as f:
                json.dump(scheduled_posts, f, indent=2)
        
        return {
            'posted_count': posted_count,
            'total_scheduled': len([p for p in scheduled_posts if p['status'] == 'scheduled'])
        }