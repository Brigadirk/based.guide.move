from postmarker.core import PostmarkClient
import time
from datetime import datetime, timedelta

# Initialize client with both tokens
client = PostmarkClient(
    server_token='89273b04-48a1-48c9-bed9-dbdf3717620a',
    account_token='02f53151-696c-4762-815e-9b51a85c6fb8'
)

def check_server_status():
    print("\n=== Checking Server Status ===")
    
    # Get server details
    try:
        server = client.server.get()
        print("\nServer Configuration:")
        print(f"Name: {server.Name}")
        print(f"Color: {server.Color}")
        print(f"ApiTokens: {server.ApiTokens}")
        print(f"ServerLink: {server.ServerLink}")
        print(f"InboundAddress: {server.InboundAddress}")
        print(f"InboundHookUrl: {server.InboundHookUrl}")
        print(f"BounceHookUrl: {server.BounceHookUrl}")
        print(f"OpenHookUrl: {server.OpenHookUrl}")
        print(f"PostFirstOpenOnly: {server.PostFirstOpenOnly}")
        print(f"TrackOpens: {server.TrackOpens}")
        print(f"TrackLinks: {server.TrackLinks}")
        print(f"InboundDomain: {server.InboundDomain}")
        print(f"InboundHash: {server.InboundHash}")
    except Exception as e:
        print(f"Error fetching server configuration: {str(e)}")
    
    # Check server stats for last 24 hours
    try:
        print("\nServer Statistics (Last 24 hours):")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)
        stats = client.stats.sends(fromdate=start_date, todate=end_date)
        print("Send Statistics:")
        if stats and 'Days' in stats:
            for day in stats['Days']:
                print(f"Date: {day.get('Date', 'N/A')}")
                print(f"Sent: {day.get('Sent', 0)}")
                print(f"Processed: {day.get('Processed', 0)}")
                print(f"Failed: {day.get('Failed', 0)}")
                print("---")
        else:
            print("No send statistics available for the last 24 hours")
    except Exception as e:
        print(f"Error fetching server statistics: {str(e)}")
    
    # Check bounce rate
    try:
        print("\nBounce Statistics:")
        bounces = client.stats.bounces()
        if isinstance(bounces, (list, tuple)):
            for bounce in bounces:
                if isinstance(bounce, dict):
                    print(f"Type: {bounce.get('Type', 'N/A')}")
                    print(f"Count: {bounce.get('Count', 0)}")
                    print(f"Name: {bounce.get('Name', 'N/A')}")
                    print("---")
                else:
                    print(f"Raw bounce data: {bounce}")
        else:
            print(f"Unexpected bounce data format: {type(bounces)}")
            print(f"Raw bounce data: {bounces}")
    except Exception as e:
        print(f"Error fetching bounce statistics: {str(e)}")
    
    # Check message streams with detailed status
    try:
        print("\nMessage Stream Status (Last 10 messages):")
        messages = client.messages.outbound.all(count=10)
        queued_count = 0
        processing_count = 0
        delivered_count = 0
        failed_count = 0
        
        for message in messages:
            try:
                print(f"\nMessage Details:")
                print(f"Message ID: {getattr(message, 'MessageID', 'N/A')}")
                print(f"Status: {getattr(message, 'Status', 'N/A')}")
                print(f"To: {getattr(message, 'To', 'N/A')}")
                print(f"From: {getattr(message, 'From', 'N/A')}")
                print(f"Subject: {getattr(message, 'Subject', 'N/A')}")
                print(f"MessageStream: {getattr(message, 'MessageStream', 'N/A')}")
                print(f"Sent: {getattr(message, 'SentDateUtc', 'N/A')}")
                print(f"Received: {getattr(message, 'ReceivedAt', 'N/A')}")
                
                # Additional details for troubleshooting
                print(f"Tag: {getattr(message, 'Tag', 'N/A')}")
                print(f"TrackOpens: {getattr(message, 'TrackOpens', 'N/A')}")
                print(f"TrackLinks: {getattr(message, 'TrackLinks', 'N/A')}")
                
                status = getattr(message, 'Status', 'Unknown')
                if status == 'Queued':
                    queued_count += 1
                elif status == 'Processing':
                    processing_count += 1
                elif status == 'Delivered':
                    delivered_count += 1
                else:
                    failed_count += 1
                    # Print additional details for failed messages
                    print(f"Error Code: {getattr(message, 'ErrorCode', 'N/A')}")
                    print(f"Error Message: {getattr(message, 'Message', 'N/A')}")
                print("---")
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                continue
        
        print("\nQueue Summary:")
        print(f"Queued Messages: {queued_count}")
        print(f"Processing Messages: {processing_count}")
        print(f"Delivered Messages: {delivered_count}")
        print(f"Failed/Other Messages: {failed_count}")
        
        # Get server queue time
        try:
            print("\nServer Queue Time:")
            queue_time = client.stats.outbound()
            print(f"Average Message Processing Time: {queue_time}")
        except Exception as e:
            print(f"Error fetching queue time: {str(e)}")
        
    except Exception as e:
        print(f"Error fetching message streams: {str(e)}")
    
    # Check server status
    try:
        print("\nServer Status:")
        status = client.status.get()
        print(f"Status: {status}")
    except Exception as e:
        print(f"Error fetching server status: {str(e)}")

if __name__ == '__main__':
    check_server_status() 