import { notFound } from "next/navigation";
import { utilities } from "../../../data/utilities";
import WorkspaceContainer from "../../../components/common/WorkspaceContainer";

export async function generateStaticParams() {
  return utilities.map((u) => ({
    utilityId: u.id,
  }));
}

export async function generateMetadata({ params }) {
  const { utilityId } = await params;
  const utility = utilities.find((u) => u.id === utilityId);

  if (!utility) {
    return {
      title: "Utility Not Found",
      description: "The requested developer utility could not be found.",
    };
  }

  return {
    title: `${utility.title} - Free Online Developer Tool`,
    description: utility.description,
    keywords: utility.tags.join(", "),
    alternates: {
      canonical: `/utility/${utility.id}`,
    },
    openGraph: {
      title: `${utility.title} - Free Online Developer Tool | DevutiliX`,
      description: utility.description,
      type: "website",
      url: `https://devutilix.com/utility/${utility.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${utility.title} | DevutiliX`,
      description: utility.description,
    },
  };
}

export default async function UtilityPage({ params }) {
  const { utilityId } = await params;
  const utility = utilities.find((u) => u.id === utilityId);

  if (!utility) {
    notFound();
  }

  return (
    <main className="flex-1">
      <WorkspaceContainer utility={utility} />
    </main>
  );
}
