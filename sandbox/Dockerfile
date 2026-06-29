FROM docker.io/cloudflare/sandbox:0.12.1-python

# Install lizard for cyclomatic complexity analysis
RUN pip3 install lizard

# Copy only the shell scripts — the skill itself is packaged into the Worker.
# analyze.sh must be in the container because the agent calls it via shell.
COPY skills/repo-analysis/analyze.sh /workspace/.agents/skills/repo-analysis/analyze.sh
RUN chmod +x /workspace/.agents/skills/repo-analysis/analyze.sh
