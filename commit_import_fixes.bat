@echo off
cd /d "C:\Users\User\OneDrive\Desktop\learn_sol"
git add components/collaboration/CollaborationHub.tsx components/learning/LearningDashboard.tsx README.md
git commit -m "Edit: Fix UI component import paths for build compatibility"
git push
echo "Changes committed and pushed successfully!"
pause
