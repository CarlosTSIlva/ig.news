import { GetServerSideProps } from "next";
import { getSession, session } from "next-auth/client";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import styles from "./posts.module.scss";

interface PostsProps {
  posts: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>{posts.title} | ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{posts.title}</h1>
          <time>{posts.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{
              __html: posts.content,
            }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const sessions = await getSession({ req });
  if (!sessions?.activeSubscription) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  const { slug } = params;

  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID("post", String(slug), {});
  console.log(response);

  const posts = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      posts,
    },
  };
};
