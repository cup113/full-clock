call pnpm run build
git tag %1
call netlify deploy --prod --message %1 --dir ./dist
git push origin main
