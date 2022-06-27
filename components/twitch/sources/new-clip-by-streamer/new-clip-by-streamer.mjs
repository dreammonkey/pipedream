import common from "../common-polling.mjs";
import twitch from "../../twitch.app.mjs";

export default {
  ...common,
  name: "New Clip By Streamer",
  key: "twitch-new-clip-by-streamer",
  description: "Emit new event when there is a new clip for the specified streamer.",
  version: "0.0.1",
  type: "source",
  props: {
    ...common.props,
    streamer: {
      type: "string",
      label: "Streamer",
      description: "The name of the streamer to watch for new clips.",
    },
    max: {
      propDefinition: [
        twitch,
        "max",
      ],
    },
  },
  methods: {
    ...common.methods,
    getMeta({
      id,
      title,
      created_at: createdAt,
      creator_name: creatorName,
    }) {
      const ts = new Date(createdAt).getTime();
      return {
        id,
        summary: `${creatorName} - ${title}`,
        ts,
      };
    },
  },
  async run() {
    // Get streamer id
    const res = await this.twitch.getMultipleUsers({
      login: this.streamer,
    });
    if (!res.data.data || res.data.data.length == 0) {
      console.log(`No streamer found with the name "${this.streamer}"`);
      return;
    }

    const lastEvent = this.getLastEvent();
    const params = {
      broadcaster_id: res.data.data[0].id,
      started_at: lastEvent
        ? new Date(lastEvent)
        : new Date(),
    };

    const clips = await this.paginate(
      this.twitch.getClips.bind(this),
      params,
      this.max,
    );
    for await (const clip of clips) {
      this.$emit(clip, this.getMeta(clip));
    }

    this.setLastEvent(Date.now());
  },
};
