import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { getPublishedPostById } from "../lib/postsCache";
import "../styles/postDetail.scss";
import BackLink from "../components/backLink/BackLink";

export default function PostDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
const isBlogRoute = pathname.startsWith("/blog");
const backUrl = isBlogRoute ? "/blog" : "/noticias";
const allowedTypes = isBlogRoute ? ["blog"] : ["news", "event", "urgent"];
const allowedTypesKey = allowedTypes.join(",");
  const { i18n } = useTranslation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "cats";

  useEffect(() => {
    let mounted = true;

    (async () => {
      const data = await getPublishedPostById(id, allowedTypes);

      if (mounted) {
        setPost(data);
        setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [id, allowedTypesKey]);

  if (loading) return <main className="postDetail">Cargando...</main>;
  if (!post) return <main className="postDetail">No encontrado</main>;

  const isCat = i18n.language?.startsWith("cat");

  const title =
    (isCat ? post.title_cat : post.title_es) ||
    post.title_es ||
    post.title_cat ||
    "";

  const content =
    (isCat ? post.content_cat : post.content_es) ||
    post.content_es ||
    post.content_cat ||
    "";

  const imageUrl = post.image_path
  ? supabase.storage.from(BUCKET).getPublicUrl(post.image_path).data?.publicUrl
  : null;


  return (
    <main className="postDetail">
      <div className="postDetail__container">
<BackLink to={backUrl} />
        {imageUrl && (
          <img
            className="postDetail__image"
            src={imageUrl}
            alt={title}
          />
        )}

        <h1 className="postDetail__title">{title}</h1>

        <div className="postDetail__content">
          {content}
        </div>

      </div>
    </main>
  );
}
