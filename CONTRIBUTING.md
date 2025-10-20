# Contributing to DIAS

Thank you for considering contributing to DIAS (Disaster Information & Alert System)! 🌍

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/DIAS.git
   cd DIAS
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Write clear commit messages
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

See [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
./start.sh
```

## Code Style

### JavaScript/React
- Use ES6+ features
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic

### Git Commits
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add cyclone severity calculation
fix: resolve map clustering issue
docs: update AWS setup instructions
```

## Project Structure

```
DIAS/
├── backend/         # Node.js/Express backend
│   ├── controllers/ # Request handlers
│   ├── services/    # Business logic
│   ├── routes/      # API routes
│   └── jobs/        # Scheduled jobs
├── src/             # React frontend
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   └── contexts/    # React contexts
└── docs/            # Documentation
```

## Testing

Before submitting a PR:
1. Test all affected features manually
2. Check for console errors
3. Verify responsive design
4. Test API endpoints

```bash
# Frontend lint
npm run lint

# Backend tests (if available)
cd backend && npm test
```

## Areas We Need Help

- [ ] Unit tests for backend services
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests
- [ ] Additional disaster data sources
- [ ] Improved map clustering algorithms
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Performance optimizations

## Questions?

Feel free to open an issue or reach out to the maintainers.

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build something amazing together.

---

Thank you for contributing to DIAS! 🌍❤️

