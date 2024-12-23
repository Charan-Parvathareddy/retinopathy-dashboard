import { useState, useEffect } from 'react';
import Image from 'next/image';
import { styled } from '@/stitches.config';
import { AnimatePresence, motion } from 'framer-motion';
import useIsMounted from '@/helpers/hooks/use-is-mounted';
import { imageLoader } from '@/helpers/image-loader';

const DottedCircle = styled(motion.div, {
  position: 'absolute',
  width: '280px',
  height: '280px',
  borderRadius: '50%',
  border: '3px dotted $cyan2',
  transition: '200ms',
  variants: {
    color: {
      cyan1: {
        border: '3px dotted $cyan1',
      },
      cyan9: {
        border: '3px dotted $cyan9',
      },
    }
  }
});

const Box = styled(motion.div, {
  // Add any additional styles for the Box component if needed
});

interface ModelRenderProps {
  isAnalyzing: boolean;
  onAnimationComplete: () => void;
}

const ModelRender: React.FC<ModelRenderProps> = ({ isAnalyzing, onAnimationComplete }) => {
  const [hover, setHover] = useState<boolean>(false);
  const isMounted = useIsMounted();
  const [animationEnded, setAnimationEnded] = useState<boolean>(false);

  const srcPath = `/quark_light.gif`;

  useEffect(() => {
    if (!isAnalyzing && animationEnded) {
      onAnimationComplete();
    }
  }, [isAnalyzing, animationEnded, onAnimationComplete]);

  if (!isAnalyzing) {
    return null;
  }

  return (
    <Wrapper>
      <ImageWrapper onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <AnimatePresence>
          <DottedCircle
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={
              animationEnded
                ? { 
                    scale: hover ? [1, 1, 1] : [1.02, 1.05, 1.02],
                    opacity: 1,
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%'
                  }
                : { 
                    opacity: 1,
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%'
                  }
            }
            onAnimationComplete={() => setAnimationEnded(true)}
            transition={
              animationEnded
                ? {
                    repeat: Infinity,
                    duration: 4,
                    times: [0, 0.5, 1]
                  }
                : {
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                    delay: 1.8,
                  }
            }
            color={hover ? 'cyan1' : undefined}
          />
        </AnimatePresence>
        <Box
          as={motion.div}
          animate={{
            rotate: [0, 20, 0],
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <AnimatePresence>
            {isMounted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                exit={{ scale: 0 }}
                key="quark_gif"
              >
                <Image
                  loader={imageLoader}
                  src={srcPath}
                  alt="Sample analysis"
                  width={250}
                  height={250}
                  draggable={false}
                  style={{ userSelect: 'none' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </ImageWrapper>
    </Wrapper>
  );
};

const Wrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  background: 'transparent',
});

const ImageWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '300px',
  height: '300px',
  position: 'relative',
});

export default ModelRender;

