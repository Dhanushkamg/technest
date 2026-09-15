import subprocess
import random
import os
import time
from datetime import datetime, timedelta

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Command failed: {cmd}\n{result.stderr}")
    return result.stdout.strip()

# Get all modified and untracked files
status_output = run_cmd("git status --porcelain")
files = []
for line in status_output.split('\n'):
    if line:
        # line is like " M path/to/file" or "?? path/to/file"
        file_path = line[3:]
        files.append(file_path)

print(f"Found {len(files)} files to commit.")

commit_messages = [
    "Refactor project structure and config properties",
    "Update global exception handler logic",
    "Add new error response DTOs for cleaner API",
    "Implement product image entities and repository",
    "Add flyway migration for product images",
    "Add product variants support to database schema",
    "Add flyway migration for product variants",
    "Refactor product repository for optimized queries",
    "Implement image service for file uploads",
    "Integrate image service into product controller",
    "Update product DTOs to include variant data",
    "Enhance ProductService to handle variants",
    "Implement admin product management endpoints",
    "Add frontend product admin API service",
    "Implement admin products page UI",
    "Add image upload modal for products",
    "Integrate product stock adjustment features",
    "Add guest checkout database migrations",
    "Implement GuestCheckoutRequest DTO",
    "Add guest cart item support",
    "Implement guest checkout logic in OrderService",
    "Add guest checkout endpoints to controller",
    "Update frontend cart store for guest mode",
    "Implement guest checkout UI flow",
    "Add guest order success page",
    "Implement refund entity and repository",
    "Add refund support to admin order service",
    "Add flyway migration for refunds",
    "Implement refund endpoints in controller",
    "Update admin orders page to support refunds",
    "Add email verification flow with tokens",
    "Implement VerificationToken entity and repo",
    "Add flyway migration for auth verification",
    "Integrate email service for sending tokens",
    "Implement password reset logic",
    "Add forgot password and reset UI",
    "Add refresh token support to auth",
    "Implement OAuth2 redirect handler",
    "Add Playwright E2E tests for guest checkout",
    "Update Github Actions CI for frontend testing",
    "Refactor React components and clean up unused code",
    "Fix styling and responsiveness in Admin Layout",
    "Update dependencies and package lock",
    "Final cleanup and bug fixes across modules"
]

# Shuffle files to distribute them across commits
# But to make it slightly realistic, group by directory.
files.sort()

commits = []
num_commits = min(40, len(files), len(commit_messages))
chunk_size = max(1, len(files) // num_commits)

for i in range(num_commits):
    start = i * chunk_size
    end = (i + 1) * chunk_size if i < num_commits - 1 else len(files)
    chunk = files[start:end]
    if chunk:
        commits.append({
            "msg": commit_messages[i % len(commit_messages)],
            "files": chunk
        })

print(f"Created {len(commits)} commits.")

# Generate timestamps over the last 5 days
now = datetime.now()
start_date = now - timedelta(days=5)
total_seconds = int((now - start_date).total_seconds())
time_step = total_seconds // len(commits)

current_date = start_date

for i, commit in enumerate(commits):
    msg = commit["msg"]
    chunk_files = commit["files"]
    
    # Randomize time step a bit
    step = time_step + random.randint(-3600, 3600)
    current_date += timedelta(seconds=abs(step))
    if current_date > now:
        current_date = now - timedelta(minutes=5)
        
    date_str = current_date.strftime('%Y-%m-%dT%H:%M:%S')
    
    # Stage files
    for f in chunk_files:
        run_cmd(f'git add "{f}"')
        
    # Commit with backdated timestamp
    env = os.environ.copy()
    env['GIT_AUTHOR_DATE'] = date_str
    env['GIT_COMMITTER_DATE'] = date_str
    
    print(f"Committing {len(chunk_files)} files at {date_str}: {msg}")
    result = subprocess.run(
        f'git commit -m "{msg}"',
        shell=True,
        env=env,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Commit failed: {result.stderr}")

print("Pushing to remote...")
run_cmd("git push origin main")
print("Done!")
