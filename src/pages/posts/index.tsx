import { GetStaticProps } from "next";
import Header from "next/head";
import { getPrismicClient } from "../../services/prismic";
import style from "./styles.module.scss";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

type Posts = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Posts[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Header>
        <title>Posts | ignews</title>
      </Header>
      {posts.map((post) => (
        <main key={post.slug} className={style.container}>
          <div className={style.posts}>
            <a>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          </div>
        </main>
      ))}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    { fetch: ["post.title", "post.content"], pageSize: 100 }
  );
  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find((content) => content.type === "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
