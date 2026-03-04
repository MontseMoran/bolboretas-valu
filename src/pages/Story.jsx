import React from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackLink from "../components/backLink/BackLink";
import "../styles/story.scss";

const STORIES = {
  felix: {
    image: "images/felix.png",
    badgeKey: "adopted_badge",
    titleKey: "story_felix_title",
    p1Key: "story_felix_p1",
    p2Key: "story_felix_p2",
  },
  vincent: {
    image: "images/vincent.png",
    badgeKey: "adopted_badge",
    titleKey: "story_vincent_title",
    p1Key: "story_vincent_p1",
    p2Key: "story_vincent_p2",
  },
  bob: {
    image: "images/bob.png",
    badgeKey: "adopted_badge",
    titleKey: "story_bob_title",
    p1Key: "story_bob_p1",
    p2Key: "story_bob_p2",
  },
  tona: {
    image: "images/tona.png",
    badgeKey: "in_foster_badge",
    titleKey: "story_tona_title",
    p1Key: "story_tona_p1",
    p2Key: "story_tona_p2",
  },
};

export default function Story() {
  const { slug } = useParams();
  const { t } = useTranslation("home");
  const story = STORIES[slug];

  if (!story) {
    return (
      <main className="story-page">
        <div className="story-page__container container">
          <h1 className="story-page__title">{t("story_not_found_title")}</h1>
          <p className="story-page__intro">{t("story_not_found_text")}</p>
          <Link to="/" className="story-page__cta">
            {t("story_back_home")}
          </Link>
        </div>
      </main>
    );
  }

  const storyBlock = t(`${slug}_story`, { returnObjects: true, defaultValue: null });

  const hasStructuredStory =
    storyBlock && typeof storyBlock === "object" && !Array.isArray(storyBlock);

  const title = hasStructuredStory && storyBlock.title
    ? storyBlock.title
    : t(story.titleKey);

  let paragraphs = [];

  if (hasStructuredStory) {
    paragraphs = Object.keys(storyBlock)
      .filter((key) => /^p\d+$/.test(key) && typeof storyBlock[key] === "string")
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .map((key) => storyBlock[key]);
  }

  if (!paragraphs.length) {
    paragraphs = [t(story.p1Key), t(story.p2Key)].filter(Boolean);
  }

  return (
    <main className="story-page">
      <div className="story-page__container container">
        <BackLink to="/" />

        <article className="story-page__card">
          <header className="story-page__header">
            <h1 className="story-page__title">{title}</h1>
            <p className="story-page__intro">{t("story_intro")}</p>
          </header>

          <div className="story-page__media">
            <img src={story.image} alt={title} />
            <span className="story-page__badge">{t(story.badgeKey)}</span>
          </div>

          <div className="story-page__content">
            {paragraphs.map((paragraph, index) => (
              <p key={`${slug}-p-${index + 1}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
