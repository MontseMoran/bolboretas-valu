import React, { useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import "./supportForm.scss";


export default function SupportForm({
  mode = "donation",
  context = null,
  showAmount,
}) {
  const { t, i18n } = useTranslation("common");

  const isCatLang =
    i18n.language?.startsWith("cat") ||
    i18n.language?.startsWith("ca");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [warnMsg, setWarnMsg] = useState("");

  const title = useMemo(() => {
    if (mode === "volunteer") return t("support_volunteer_title");
    if (mode === "member") return t("support_member_title");
    if (mode === "sponsor") return t("support_sponsor_title");
    if (mode === "cat")
      return t("support_cat_title", { name: context?.catName || "" });
    return t("support_donation_title");
  }, [mode, context, t]);

  const shouldShowAmount =
    showAmount ?? ["donation", "member", "sponsor"].includes(mode);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    setErrMsg("");
    setOkMsg("");
    setWarnMsg("");

    try {
      const payload = {
        mode,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        amount: shouldShowAmount ? Number(amount || 0) : null,
        message: message.trim(),

        cat_id: context?.catId || null,
        cat_name: context?.catName || null,

        lang: isCatLang ? "cat" : "es",
      };

      const { error } = await supabase
        .from("inquiries")
        .insert([payload]);

      if (error) throw error;

      const { error: notifyError } = await supabase.functions.invoke(
        "send-inquiry-email",
        {
          body: {
            ...payload,
            inquiry_id: null,
            created_at: null,
          },
        }
      );

      if (notifyError) {
        console.error("send-inquiry-email invoke error:", notifyError);
        setWarnMsg(t("support_notice_email_failed"));
      }

      setOkMsg(t("support_sent_ok"));

      setName("");
      setEmail("");
      setPhone("");
      setAmount("");
      setMessage("");

    } catch (err) {
      console.error("SupportForm submit error:", err);
      setErrMsg(t("support_sent_error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="support-form">

      <h2 className="support-form__title">
        {title}
      </h2>

      <form
        className="support-form__grid"
        onSubmit={handleSubmit}
      >

        <label className="support-form__field">
          <span>{t("support_name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="support-form__field">
          <span>{t("support_email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="support-form__field">
          <span>{t("support_phone")}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        {shouldShowAmount && (
          <label className="support-form__field">
            <span>{t("support_amount")}</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        )}

        <label className="support-form__field support-form__field--full">
          <span>{t("support_message")}</span>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>

        {errMsg && (
          <div className="support-form__msg support-form__msg--err">
            {errMsg}
          </div>
        )}

        {okMsg && (
          <div className="support-form__msg support-form__msg--ok">
            {okMsg}
          </div>
        )}

        {warnMsg && (
          <div className="support-form__msg support-form__msg--warn">
            {warnMsg}
          </div>
        )}

        <button
          className="support-form__btn cat-card__readmore"
          disabled={sending}
        >
          {sending
            ? t("support_sending")
            : t("support_send")}
        </button>

      </form>

    </section>
  );
}
