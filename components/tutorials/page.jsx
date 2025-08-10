// components/YourComponent.jsx ( లేదా పేజీ )
import Link from "next/link";

export default function Tutorials() {
  return (
    <div>
      <Link
        href="https://code2tutorial.com/tutorial/20896856-14e7-4fa4-a727-c5892be3f0c5/index.md"
        className="hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tutorials
      </Link>
    </div>
  );
}
