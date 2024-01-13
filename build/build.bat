call pnpm run build
call netlify deploy --prod -d dist --message %1
git push origin main
gh release create %1
