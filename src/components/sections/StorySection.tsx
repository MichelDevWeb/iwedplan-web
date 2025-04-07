import React from 'react';

const StorySection = () => {
  return (
    <section id="story" className="w-full py-16 flex flex-col items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-4 text-center animated fadeInDown">Chuyện Tình Yêu</h2>
      <blockquote className="text-center text-gray-600 italic mb-8 max-w-2xl animated fadeInUp delay-1s">
      &#34;Tình yêu không chỉ là một danh từ - nó là một động từ; nó còn hơn cả một cảm giác - đó là sự quan tâm, chia sẻ, giúp đỡ, hy sinh.&#34;
      </blockquote>

      {/* TODO: Replace with the actual love story */}
      <div className="prose lg:prose-lg text-left max-w-3xl mx-auto text-gray-700 animated fadeIn delay-2s">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra,
          est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.
        </p>
      </div>

       {/* Optional: Add a small image or graphic here */}

    </section>
  );
};

export default StorySection; 