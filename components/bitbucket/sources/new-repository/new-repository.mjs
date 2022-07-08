import common from "../common/common.mjs";

export default {
  ...common,
  type: "source",
  name: "New Repository (Instant)",
  key: "bitbucket-new-repository",
  description: "Emit new event when a new repository is created in a workspace. [See docs here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-workspaces/#api-workspaces-workspace-hooks-post)",
  version: "0.0.2",
  methods: {
    ...common.methods,
    getPath() {
      return `workspaces/${this.workspaceId}/hooks`;
    },
    getWebhookEventTypes() {
      return [
        "repo:created",
      ];
    },
    async loadHistoricalData() {
      const repositories = await this.bitbucket.getRepositories({
        workspaceId: this.workspaceId,
        params: {
          page: 1,
          pagelen: 25,
        },
      });
      return repositories.map((repository) => ({
        main: repository,
        sub: {
          id: repository.id,
          summary: `New repository ${repository.name} created`,
          ts: Date.parse(repository.created_on),
        },
      }));
    },
    proccessEvent(event) {
      const { repository } = event.body;

      this.$emit(repository, {
        id: repository.id,
        summary: `New repository ${repository.name} created`,
        ts: Date.parse(repository.created_on),
      });
    },
  },
};
